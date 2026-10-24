export function GroupEditRefreshNotice({ failed }: { failed: boolean }) {
  return failed ? <p role="alert" className="member-form-summary mb-5">The latest group details could not be checked. Your entries are kept; review the saved group before retrying an uncertain change.</p> : null;
}
