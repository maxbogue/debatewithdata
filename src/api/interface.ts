export default interface Api {
  register(username: string, password: string, email: string): Promise<object>;
  verifyEmail(verificationToken: string): Promise<string>;
  login(username: string, password: string): Promise<string>;
  forgotPassword(email: string): Promise<object>;
  resetPassword(resetToken: string, password: string): Promise<string>;
  getUser(username: string): Promise<object>;
  getItem(type: string, id: string, trail: string[]): Promise<object>;
  getItems(type: string, filters: [string, boolean][], sort: [string, boolean], page: number): Promise<object>;
  search(query: string, types: string[], page: number): Promise<object>;
  createItem(type: string, itemData: object): Promise<object>;
  updateItem(type: string, id: string, itemData: object): Promise<object>;
  deleteItem(type: string, id: string, message: string): Promise<object>;
  getItemRevs(type: string, id: string): Promise<object>;
  toggleStar(type: string, id: string): Promise<object>;
  toggleWatch(type: string, id: string): Promise<object>;
  getComments(type: string, id: string): Promise<object>;
  createComment(type: string, id: string, text: string): Promise<object>;
  deleteComment(type: string, id: string, commentId: string): Promise<object>;
  getActivity(): Promise<object>;
  hasNotifications(): Promise<object>;
  getNotifications(): Promise<object>;
  readNotifications(until: string): Promise<object>;
}
