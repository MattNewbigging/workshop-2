import { SpaceScene } from "../game/space-scene";
import "./game-over-screen.scss";
import React from "react";

interface GameOverScreenProps {
  spaceScene: SpaceScene;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  spaceScene,
}) => {
  return (
    <div className="game-over-screen">
      <div className="scifi-button white" onClick={spaceScene.reset}>
        PLAY AGAIN
      </div>
    </div>
  );
};
