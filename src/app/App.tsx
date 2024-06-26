import "./app.scss";

import React from "react";
import { observer } from "mobx-react-lite";

import { AppState } from "./app-state";
import { LoadingScreen } from "../loading-screen/loading-screen";
import { GameOverScreen } from "../game-over-screen/game-over-screen";

interface AppProps {
  appState: AppState;
}

export const App: React.FC<AppProps> = observer(({ appState }) => {
  const spaceScene = appState.gameState?.spaceScene;

  return (
    <div id="canvas-root">
      {appState.gameLoader.loading && <LoadingScreen />}
      {spaceScene && spaceScene.gameOver && (
        <GameOverScreen spaceScene={spaceScene} />
      )}
    </div>
  );
});
