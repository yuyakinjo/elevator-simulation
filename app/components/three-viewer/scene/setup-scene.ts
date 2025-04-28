import * as THREE from "three";
import type { SceneSetup } from "../types";

export function setupScene(mountElement: HTMLDivElement): SceneSetup {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(mountElement.clientWidth, mountElement.clientHeight);
  mountElement.appendChild(renderer.domElement);

  return { scene, renderer };
}
