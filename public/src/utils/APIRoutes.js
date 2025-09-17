export const host = "http://localhost:5001";

export const loginRoute = `${host}/api/auth/login`;
export const registerRoute = `${host}/api/auth/register`;
export const logoutRoute = `${host}/api/auth/logout`;
export const allUsersRoute = `${host}/api/auth/allusers`;
export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const recieveMessageRoute = `${host}/api/messages/getmsg`;
export const setAvatarRoute = `${host}/api/auth/setavatar`;
export const deleteMessageRoute = `${host}/api/messages/deletemsg`;
export const reactMessageRoute = `${host}/api/messages/reactmsg`;
export const uploadRoute = `${host}/api/upload`;

// Bot routes
export const startBotChatRoute = `${host}/api/bot/start`;
export const continueBotChatRoute = `${host}/api/bot/continue`;
export const getBotHistoryRoute = `${host}/api/bot/history`;
export const getBotConversationsRoute = `${host}/api/bot/conversations`;
