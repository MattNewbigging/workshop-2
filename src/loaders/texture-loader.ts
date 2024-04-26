import * as THREE from "three";

export class TextureLoader {
  doneLoading = false;

  private textures = new Map<string, THREE.Texture>();
  private loadingManager = new THREE.LoadingManager();

  get(name: string): THREE.Texture | null {
    const texture = this.textures.get(name);

    return texture ?? null;
  }

  load(onLoad: () => void) {
    // Setup loading manager
    this.loadingManager.onError = (url) => console.error("error loading", url);

    this.loadingManager.onLoad = () => {
      this.doneLoading = true;
      onLoad();
    };

    this.loadTextures();
  }

  private loadTextures() {
    const loader = new THREE.TextureLoader(this.loadingManager);

    // Get a map of all urls and names for each texture to load in the same manner
    const nameUrlMap = this.getNameUrlMap();
    nameUrlMap.forEach((url, name) => {
      loader.load(url, (texture) => {
        texture.encoding = THREE.sRGBEncoding;
        this.textures.set(name, texture);
      });
    });

    // Load other textures with more specific configs
    this.loadSkybox();
  }

  private getNameUrlMap() {
    const nameUrlMap = new Map<string, string>();

    const atlast1aUrl = new URL("/textures/atlas_1A.png", import.meta.url).href;
    nameUrlMap.set("atlas-1a", atlast1aUrl);

    return nameUrlMap;
  }

  private loadSkybox() {
    const loader = new THREE.CubeTextureLoader(this.loadingManager);
    const backUrl = new URL("/textures/skybox_03_back.png", import.meta.url)
      .href;
    const downUrl = new URL("/textures/skybox_03_down.png", import.meta.url)
      .href;
    const frontUrl = new URL("/textures/skybox_03_front.png", import.meta.url)
      .href;
    const leftUrl = new URL("/textures/skybox_03_left.png", import.meta.url)
      .href;
    const rightUrl = new URL("/textures/skybox_03_right.png", import.meta.url)
      .href;
    const upUrl = new URL("/textures/skybox_03_up.png", import.meta.url).href;

    // +x, -x, +y, -y, +z, -z
    // front, back, up, down, left, right
    // except synty assets are stupid, so it is:
    const urls = [leftUrl, rightUrl, upUrl, downUrl, frontUrl, backUrl];

    const cubeTexture = loader.load(urls);
    this.textures.set("skybox", cubeTexture);
  }
}
