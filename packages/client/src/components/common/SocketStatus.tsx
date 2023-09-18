import { SOCKET_READY_STATES, useMultiplayerClient } from '@hooks/multiplayer/index';

type ConnectionInfo = {
  className: string;
  text: string;
};

const SocketStatus = () => {
  const { connectionStatus } = useMultiplayerClient();

  const connectionInfo = getStatusIcon(connectionStatus);

  return <div className={`socket-status-indicator ${connectionInfo.className}`}>{connectionInfo.text}</div>;
};

const getStatusIcon = (status: number): ConnectionInfo => {
  if (status === SOCKET_READY_STATES.CONNECTING) {
    return {
      className: 'connecting',
      text: 'connecting...',
    };
  } else if (status === SOCKET_READY_STATES.OPEN) {
    return {
      className: 'connected',
      text: 'connected',
    };
  } else {
    return {
      className: 'failed',
      text: 'connection failed',
    };
  }
};

export default SocketStatus;
