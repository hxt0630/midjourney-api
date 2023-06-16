export interface MessageConfig {
  ChannelId: string;
  SalaiToken: string;
  Debug: boolean;
  Limit: number;
  MaxWait: number;
  Concurrent?:number;
  ServerId: string;
  SessionId: string;
  Ws?: boolean;
  HuggingFaceToken?: string;
}
export interface MessageConfigParam {
  ChannelId: string;
  SalaiToken: string;
  Debug?: boolean;
  Limit?: number;
  MaxWait?: number;
  Concurrent?:number;
  Ws?: boolean;
  HuggingFaceToken?: string;
  ServerId?: string;
  SessionId?: string;
}
export interface MidjourneyConfig extends MessageConfig {
  ServerId: string;
  SessionId: string;
}

export interface MidjourneyConfigParam extends MessageConfigParam {
  ServerId: string;
  SessionId?: string;
}
export const DefaultMessageConfig: MessageConfig = {
  ChannelId: "",
  SalaiToken: "",
  ServerId: "",
  SessionId: "",
  Debug: false,
  Concurrent:1,
  Limit: 50,
  MaxWait: 100,
};
export const DefaultMidjourneyConfig: MidjourneyConfig = {
  ...DefaultMessageConfig,
  ServerId: "",
  SessionId: "8bb7f5b79c7a49f7d0824ab4b8773a81",
//   DiscordBaseUrl: "https://discord.com",
// WsBaseUrl: "wss://gateway.discord.gg?v=9&encoding=json&compress=gzip-stream",
};


