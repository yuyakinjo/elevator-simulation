import * as THREE from "three";

export function setupLights(scene: THREE.Scene): void {
  // 環境光（柔らかい全体光）
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  // 方向光（太陽光風）
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(10, 40, 20);
  scene.add(directionalLight);
}
