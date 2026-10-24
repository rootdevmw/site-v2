declare module "sanitize-html" {
  export interface Tag {
    tagName: string;
    attribs: Record<string, string>;
    text?: string;
  }

  export interface IFrame {
    tag: string;
    attribs: Record<string, string>;
    text?: string;
    mediaChildren?: boolean;
  }

  export interface IOptions {
    allowedTags?: string[] | false;
    allowedAttributes?: Record<string, string[]> | false;
    nonTextTags?: string[];
    nestingLimit?: number;
    transformTags?: Record<
      string,
      string | ((tagName: string, attribs: Record<string, string>) => Tag | { tagName: string; attribs: Record<string, string>; text?: string })
    >;
    exclusiveFilter?: (frame: IFrame) => boolean | "excludeTag";
    [key: string]: any;
  }

  function sanitizeHtml(dirty: string, options?: IOptions): string;

  namespace sanitizeHtml {
    export type { Tag, IFrame, IOptions };
  }

  export default sanitizeHtml;
}
