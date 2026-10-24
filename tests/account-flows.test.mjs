import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import * as jsx from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { sourceLoader } from "./helpers/load-source.mjs";
const helpers = sourceLoader()("lib/utils/account-flows.ts");
const user = { id: "7", email: "person@example.test", roles: ["VISITOR"] },
  token = "a".repeat(64);
const loginValues = { email: user.email, password: " old password " },
  passwordValues = { password: " new password ", confirm: " new password " };

test("account schemas normalize emails and preserve password spaces with consistent UTF-8 bounds", () => {
  assert.deepEqual(
    helpers.accountLoginSchema.parse({
      email: " Person@Example.test ",
      password: loginValues.password,
    }),
    loginValues,
  );
  assert.equal(
    helpers.accountPasswordSchema.safeParse(passwordValues).success,
    true,
  );
  assert.equal(
    helpers.accountNewPasswordSchema.safeParse("\u{1F600}".repeat(18)).success,
    true,
  );
  for (const password of [
    "short",
    "a".repeat(73),
    "\u{1F600}".repeat(19),
    "abc\u0000def",
  ])
    assert.equal(
      helpers.accountNewPasswordSchema.safeParse(password).success,
      false,
    );
  assert.equal(
    helpers.accountLoginSchema.safeParse({
      ...loginValues,
      password: "x".repeat(100),
    }).success,
    true,
  );
  assert.equal(
    helpers.accountPasswordSchema.safeParse({
      ...passwordValues,
      confirm: "different",
    }).success,
    false,
  );
  assert.equal(
    helpers.accountChangePasswordSchema.safeParse({
      ...passwordValues,
      currentPassword: "",
    }).success,
    false,
  );
});

test("account links require exactly one complete token and error feedback never exposes raw transport details", () => {
  assert.equal(helpers.accountLinkToken(new URLSearchParams({ token })), token);
  for (const params of [
    new URLSearchParams(),
    new URLSearchParams("token=short"),
    new URLSearchParams("token=" + token + "&token=" + token),
    new URLSearchParams({ token: token + " " }),
  ])
    assert.equal(helpers.accountLinkToken(params), null);
  for (const [status, operation, message] of [
    [401, "login", /not accepted/],
    [429, "login", /Too many/],
    [404, "reset", /request a new one/],
    [409, "change", /current password/],
    [403, "request", /church team/],
  ])
    assert.match(
      helpers.accountFailure(
        { response: { status, data: { message: "secret " + token } } },
        operation,
      ),
      message,
    );
  assert.doesNotMatch(
    helpers.accountFailure(new Error("secret " + token), "reset"),
    new RegExp(token),
  );
});

test("credential transports use bounded silent requests and require explicit server success", async () => {
  const calls = [];
  const api = sourceLoader({
    "@/lib/api/client": {
      api: {
        post: async (...args) => {
          calls.push(args);
          return { data: { success: true, data: {} } };
        },
      },
    },
  })("lib/api/account-flows.ts");
  for (const path of [
    "request-password-reset",
    "set-password",
    "reset-password",
    "change-password",
    "logout",
  ])
    await api.accountWrite(path, { fixture: true });
  for (const [url, body, config] of calls) {
    assert.match(url, /^\/auth\//);
    assert.deepEqual(body, { fixture: true });
    assert.equal(config.timeout, 30000);
    assert.equal(config.silent, true);
  }
  const failed = sourceLoader({
    "@/lib/api/client": {
      api: { post: async () => ({ data: { success: false, data: {} } }) },
    },
  })("lib/api/account-flows.ts");
  await assert.rejects(() => failed.accountWrite("logout"));
});

test("sign-in response uses the confirmed user without requesting /me and strips credential/session extras", async () => {
  let calls = 0;
  const actual = sourceLoader({
    "@/lib/api/client": {
      api: {
        post: async (url) => {
          calls++;
          assert.equal(url, "/auth/login");
          return {
            data: {
              success: true,
              data: { ...user, password: "private", sessionId: "private" },
            },
          };
        },
      },
    },
  })("lib/api/account-flows.ts");
  assert.deepEqual(await actual.accountSignIn(loginValues), {
    success: true,
    data: user,
  });
  assert.equal(calls, 1);
  const malformed = sourceLoader({
    "@/lib/api/client": {
      api: {
        post: async () => ({ data: { success: true, data: { id: "7" } } }),
      },
    },
  })("lib/api/account-flows.ts");
  await assert.rejects(() => malformed.accountSignIn(loginValues));
});

test("session reads are cancellable, bounded and validate/project the current identity", async () => {
  const signal = new AbortController().signal;
  let options;
  const actual = sourceLoader({
    "@/lib/api/client": {
      api: {
        get: async (_url, config) => {
          options = config;
          return {
            data: {
              success: true,
              data: { ...user, member: { private: "discard" } },
            },
          };
        },
      },
    },
  })("app/modules/auth/api/me.ts");
  assert.deepEqual(await actual.getMe(true, signal), {
    success: true,
    data: user,
  });
  assert.equal(options.signal, signal);
  assert.equal(options.timeout, 15000);
  assert.equal(options.silent, true);
});

function mutationFixture() {
  const client = new QueryClient(),
    state = {
      user: { ...user },
      loading: false,
      initialized: true,
      notice: null,
      setUser(value) {
        this.user = value;
      },
      setLoading(value) {
        this.loading = value;
      },
      setInitialized(value) {
        this.initialized = value;
      },
      setNotice(value) {
        this.notice = value;
      },
    };
  const store = Object.assign((selector) => selector(state), {
    getState: () => state,
  });
  let options;
  const load = sourceLoader({
    "@tanstack/react-query": {
      useQueryClient: () => client,
      useMutation: (value) => {
        options = value;
        return value;
      },
    },
    "@/app/modules/auth/store/auth.store": { useAuthStore: store },
    "../store/auth.store": { useAuthStore: store },
    "@/lib/api/client": { api: {} },
  });
  return {
    client,
    state,
    load,
    get options() {
      return options;
    },
  };
}

test("credential mutations avoid retries/retained cache and clear private queries on confirmed identity changes", async () => {
  for (const [file, name] of [
    ["useLogin", "useLogin"],
    ["useSetPassword", "useSetPassword"],
    ["useResetPassword", "useResetPassword"],
    ["useChangePassword", "useChangePassword"],
    ["useLogout", "useLogout"],
  ]) {
    const f = mutationFixture();
    f.load("app/modules/auth/hooks/" + file + ".ts")[name]();
    assert.equal(f.options.retry, false);
    assert.equal(f.options.gcTime, 0);
    f.client.setQueryData(["members", "previous-account"], {
      private: "fixture",
    });
    await f.options.onSuccess({ success: true, data: user });
    assert.equal(
      f.client.getQueryData(["members", "previous-account"]),
      undefined,
    );
    assert.deepEqual(f.state.user, file === "useLogin" ? user : null);
    assert.equal(f.state.initialized, true);
    assert.equal(f.state.loading, false);
    if (file === "useChangePassword")
      assert.equal(f.state.notice, "password-changed");
    f.client.clear();
  }
  const recovery = mutationFixture();
  recovery
    .load("app/modules/auth/hooks/useRequestPasswordReset.ts")
    .useRequestPasswordReset();
  assert.equal(recovery.options.retry, false);
  assert.equal(recovery.options.gcTime, 0);
  recovery.client.clear();
});

test("uncertain password changes clear stale identity and retain actionable sign-in guidance, while current-password failures do not", async () => {
  const f = mutationFixture();
  f.load("app/modules/auth/hooks/useChangePassword.ts").useChangePassword();
  await f.options.onError({ response: { status: 409 } });
  assert.deepEqual(f.state.user, user);
  f.client.setQueryData(["members"], { private: true });
  await f.options.onError(new Error("response lost"));
  assert.equal(f.state.user, null);
  assert.equal(f.state.notice, "password-uncertain");
  assert.equal(f.client.getQueryData(["members"]), undefined);
  f.client.clear();
});

test("late initial session reads cannot restore an old account after a newer identity is set", async () => {
  const store = sourceLoader()(
    "app/modules/auth/store/auth.store.ts",
  ).useAuthStore;
  store.setState({
    user: null,
    loading: true,
    initialized: false,
    sessionVersion: 0,
  });
  let effect, resolve, signal;
  const pending = new Promise((done) => {
    resolve = done;
  });
  const Provider = sourceLoader({
    react: {
      ...React,
      useEffect: (callback) => {
        effect = callback;
      },
    },
    "../store/auth.store": { useAuthStore: store },
    "../api/me": {
      getMe: (_silent, value) => {
        signal = value;
        return pending;
      },
    },
  })("app/modules/auth/components/AuthProvider.tsx").AuthProvider;
  assert.equal(Provider({ children: "child" }), "child");
  const cleanup = effect();
  store.getState().setUser(user);
  resolve({ success: true, data: { ...user, id: "8" } });
  await new Promise((done) => setTimeout(done, 0));
  assert.deepEqual(store.getState().user, user);
  assert.equal(store.getState().initialized, true);
  cleanup();
  assert.equal(signal.aborted, true);
});

function formHarness({
  source,
  exportName,
  props = {},
  values = {},
  mutate = async () => ({ success: true, data: user }),
  extra = {},
}) {
  let submit,
    cursor = 0,
    buttons = [];
  const states = [],
    resets = [],
    writes = [],
    pushes = [];
  const react = {
    ...React,
    useState: (initial) => {
      const index = cursor++;
      if (!(index in states))
        states[index] = typeof initial === "function" ? initial() : initial;
      return [
        states[index],
        (value) => {
          states[index] =
            typeof value === "function" ? value(states[index]) : value;
        },
      ];
    },
  };
  const mutation = {
    isPending: false,
    mutateAsync: async (data) => {
      writes.push(data);
      return mutate(data);
    },
  };
  const overrides = {
    react,
    "react/jsx-runtime": {
      ...jsx,
      jsx: (type, props, key) => {
        if (type === "button") buttons.push(props);
        return jsx.jsx(type, props, key);
      },
      jsxs: (type, props, key) => {
        if (type === "button") buttons.push(props);
        return jsx.jsxs(type, props, key);
      },
    },
    "react-hook-form": {
      useForm: () => ({
        formState: { errors: {}, isSubmitting: false },
        register: (name) => ({ name }),
        handleSubmit: (callback) => {
          submit = callback;
          return () => {};
        },
        getValues: (key) => values[key],
        reset: (data) => resets.push(data),
      }),
    },
    "next/navigation": {
      useRouter: () => ({ replace: (href) => pushes.push(href) }),
    },
    "@/app/modules/auth/hooks/useSetPassword": {
      useSetPassword: () => mutation,
    },
    "@/app/modules/auth/hooks/useResetPassword": {
      useResetPassword: () => mutation,
    },
    "@/app/modules/auth/hooks/useChangePassword": {
      useChangePassword: () => mutation,
    },
    "../hooks/useLogin": { useLogin: () => mutation },
    "../hooks/useRequestPasswordReset": {
      useRequestPasswordReset: () => mutation,
    },
    ...extra,
  };
  const Component = sourceLoader(overrides)(source)[exportName];
  function render() {
    cursor = 0;
    buttons = [];
    return renderToStaticMarkup(React.createElement(Component, props));
  }
  return {
    render,
    submit: () => submit?.(values),
    resets,
    writes,
    pushes,
    get buttons() {
      return buttons;
    },
  };
}

test("account shell and invitation guidance provide a main heading, normal navigation and no public signup form", () => {
  const Page = sourceLoader()("app/(auth)/register/page.tsx").default;
  const html = renderToStaticMarkup(React.createElement(Page));
  assert.match(html, /<h1>Join the church portal/);
  assert.match(html, /Accounts are set up by the church team/);
  assert.match(html, /href="\/contact"/);
  assert.match(html, /href="\/login\?mode=forgot"/);
  assert.doesNotMatch(html, /<form|type="password"/);
  assert.match(html, /<main id="account-content"/);
});

test("sign-in fields have associated labels, password-manager semantics and a confirmation-only navigation path", async () => {
  let resolve;
  const pending = new Promise((done) => {
    resolve = done;
  });
  const f = formHarness({
    source: "app/modules/auth/components/LoginForm.tsx",
    exportName: "SignInFields",
    props: { onForgot() {} },
    values: loginValues,
    mutate: () => pending,
  });
  const html = f.render();
  for (const pattern of [
    /for="signin-email"/,
    /autoComplete="username"/,
    /for="signin-password"/,
    /autoComplete="current-password"/,
    /aria-label="Show password"/,
    /type="button"/,
  ])
    assert.match(html, pattern);
  const first = f.submit();
  await f.submit();
  assert.equal(f.writes.length, 1);
  assert.deepEqual(f.pushes, []);
  resolve({ success: true, data: user });
  await first;
  assert.deepEqual(f.pushes, ["/dashboard"]);
  assert.equal(f.resets[0].password, "");
});

test("sign-in failures retain entries and distinguish invalid credentials from an unavailable server", async () => {
  const f = formHarness({
    source: "app/modules/auth/components/LoginForm.tsx",
    exportName: "SignInFields",
    props: { onForgot() {} },
    values: loginValues,
    mutate: async () => {
      throw { response: { status: 401 } };
    },
  });
  f.render();
  await f.submit();
  assert.deepEqual(f.resets, []);
  assert.deepEqual(f.pushes, []);
  assert.match(f.render(), /email and password were not accepted/);
});

test("recovery feedback is generic, keeps the email and prevents overlapping email requests", async () => {
  let resolve;
  const pending = new Promise((done) => {
    resolve = done;
  });
  const f = formHarness({
    source: "app/modules/auth/components/LoginForm.tsx",
    exportName: "RecoveryFields",
    props: { onBack() {} },
    values: { email: user.email },
    mutate: () => pending,
  });
  f.render();
  const first = f.submit();
  await f.submit();
  assert.equal(f.writes.length, 1);
  resolve({ success: true, data: {} });
  await first;
  assert.match(f.render(), /If an active account matches that email/);
  assert.match(f.render(), /Use the most recent link/);
  assert.deepEqual(f.resets, []);
  assert.equal(f.writes[0].email, user.email);
});

test("missing password links render recovery actions without a form or mutation", async () => {
  const f = formHarness({
    source: "components/accounts/AccountPasswordForm.tsx",
    exportName: "AccountPasswordForm",
    props: { token: null, kind: "set" },
    values: passwordValues,
  });
  const html = f.render();
  assert.match(html, /Use a fresh account link/);
  assert.doesNotMatch(html, /<form/);
  await f.submit();
  assert.equal(f.writes.length, 0);
});

test("setup/reset forms submit only the token and password once and show an explicit success action", async () => {
  for (const kind of ["set", "reset"]) {
    let resolve;
    const pending = new Promise((done) => {
      resolve = done;
    });
    const f = formHarness({
      source: "components/accounts/AccountPasswordForm.tsx",
      exportName: "AccountPasswordForm",
      props: { token, kind },
      values: passwordValues,
      mutate: () => pending,
    });
    const html = f.render();
    assert.match(html, /autoComplete="new-password"/);
    assert.doesNotMatch(html, new RegExp(token));
    const first = f.submit();
    await f.submit();
    assert.equal(f.writes.length, 1);
    assert.deepEqual(f.writes[0], { token, password: passwordValues.password });
    resolve({ success: true, data: {} });
    await first;
    assert.match(f.render(), /Continue to sign in/);
    assert.doesNotMatch(f.render(), /<form/);
    assert.equal(f.resets.length, 1);
  }
});

test("expired links switch to recovery while uncertain password writes retain entries and offer sign-in", async () => {
  for (const [error, expired] of [
    [{ response: { status: 404 } }, true],
    [new Error("response lost"), false],
  ]) {
    const f = formHarness({
      source: "components/accounts/AccountPasswordForm.tsx",
      exportName: "AccountPasswordForm",
      props: { token, kind: "reset" },
      values: passwordValues,
      mutate: async () => {
        throw error;
      },
    });
    f.render();
    await f.submit();
    const html = f.render();
    if (expired) {
      assert.match(html, /Request a new link/);
      assert.doesNotMatch(html, /<form/);
    } else {
      assert.match(html, /Try signing in with your new password/);
      assert.match(html, /<form/);
      assert.deepEqual(f.resets, []);
    }
  }
});

test("change-password sends the current/new password without confirmation or a delayed logout request", async () => {
  const values = { ...passwordValues, currentPassword: loginValues.password };
  const f = formHarness({
    source: "components/accounts/ChangePasswordForm.tsx",
    exportName: "ChangePasswordForm",
    values,
  });
  const html = f.render();
  assert.match(html, /autoComplete="current-password"/);
  assert.match(html, /all account sessions are signed out/);
  await f.submit();
  assert.deepEqual(f.writes, [
    {
      currentPassword: loginValues.password,
      newPassword: passwordValues.password,
    },
  ]);
  assert.equal(f.resets.length, 1);
});

test("password show/hide controls preserve autocomplete and do not submit their surrounding form", () => {
  let cursor = 0;
  const states = [];
  let buttons = [];
  const Field = sourceLoader({
    react: {
      ...React,
      useState: (initial) => {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [
          states[index],
          (value) => {
            states[index] =
              typeof value === "function" ? value(states[index]) : value;
          },
        ];
      },
    },
    "react/jsx-runtime": {
      ...jsx,
      jsx: (type, props, key) => {
        if (type === "button") buttons.push(props);
        return jsx.jsx(type, props, key);
      },
      jsxs: jsx.jsxs,
    },
  })("components/accounts/AccountFields.tsx").AccountPasswordField;
  const render = () => {
    cursor = 0;
    buttons = [];
    return renderToStaticMarkup(
      React.createElement(Field, {
        id: "secret",
        label: "New password",
        autoComplete: "new-password",
      }),
    );
  };
  assert.match(render(), /type="password"/);
  assert.equal(buttons[0].type, "button");
  buttons[0].onClick();
  const html = render();
  assert.match(html, /type="text"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /autoComplete="new-password"/);
});

test("session checking stays visible and an existing identity never blocks reauthentication", () => {
  const render = (state) => {
    const Guard = sourceLoader({
      "../store/auth.store": { useAuthStore: () => state },
      "next/navigation": { useRouter: () => ({ replace() {} }) },
    })("app/modules/auth/components/GuestGuard.tsx").GuestGuard;
    return renderToStaticMarkup(
      React.createElement(Guard, null, "Sign-in form"),
    );
  };
  assert.match(
    render({ initialized: false, user: null }),
    /Checking your session/,
  );
  assert.match(
    render({ initialized: true, user }),
    /Continue to the dashboard/,
  );
  assert.match(render({ initialized: true, user: null }), /Sign-in form/);
  assert.match(render({ initialized: true, user }), /Sign-in form/);
});
