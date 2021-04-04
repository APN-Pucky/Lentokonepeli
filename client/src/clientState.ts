export enum ConnectionState {
  CONNECTING,
  OPEN,
  CLOSED
}
export enum InputState {
  None,
  ALL,
  TEAM
}
export const ClientState = {
  showLobby: true,
  showPlayers: false,
  inputing: InputState.None,
  inputStr: "",
  connection: ConnectionState.CONNECTING,
};
