import MultiplayerService from './multiplayer-service';

class MultiplayerClient extends MultiplayerService {
  constructor() {
    super();
  }

  public createRoom() {
    // TODO: Implement in SPOT-46
    this.sendMessage({ type: 'createRoom' });
  }

  public exitRoom() {
    // TODO: Implement in SPOT-49
    this.closeConnection();
  }
}

export default new MultiplayerClient();
