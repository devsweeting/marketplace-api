export default interface IMailInfo {
  emailTo: string;
  template: string;
  content: Record<string, string>;
}
