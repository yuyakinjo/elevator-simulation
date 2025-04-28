"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export default function ThreeViewer() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Three.js の初期化
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // 建物の定数を先に定義
    const FLOOR_COUNT = 30; // フロア数を高層マンション風に増加
    const FLOOR_HEIGHT = 1.2; // フロアあたりの高さ
    const BUILDING_HEIGHT = FLOOR_COUNT * FLOOR_HEIGHT; // 建物の総高さ
    const BUILDING_WIDTH = 8;
    const BUILDING_DEPTH = 8;

    // ライト追加
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // 柔らかい全体光
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // 太陽光風
    directionalLight.position.set(10, 40, 20);
    scene.add(directionalLight);

    const camera = new THREE.PerspectiveCamera(
      60, // 視野角を少し狭くして遠近感を調整
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000,
    );

    // カメラ位置をビル全体が見えるように調整
    camera.position.set(20, BUILDING_HEIGHT / 2, 25);
    // カメラをシーンの中心（ビルの中央）に向ける
    camera.lookAt(0, BUILDING_HEIGHT / 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight,
    );
    mountRef.current.appendChild(renderer.domElement);

    // コントロールの追加
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    // コントロールの中心点（ターゲット）をビルの中央に設定
    controls.target.set(0, BUILDING_HEIGHT / 2, 0);
    // 初期設定を適用
    controls.update();

    // 建物パーツのグループ化（透明度を一括制御するため）
    const buildingParts = new THREE.Group();
    scene.add(buildingParts);

    // 本体（外壁）
    const buildingGeometry = new THREE.BoxGeometry(
      BUILDING_WIDTH,
      BUILDING_HEIGHT,
      BUILDING_DEPTH,
    );
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5, // 白系
      roughness: 0.7,
      metalness: 0.1,
      transparent: true, // 透明化可能に設定
      opacity: 1.0, // 初期値は不透明
      name: "building", // マテリアル名を追加
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = BUILDING_HEIGHT / 2;
    buildingParts.add(building); // グループに追加

    // バルコニーと手すり
    for (let i = 0; i < FLOOR_COUNT; i++) {
      // バルコニー床
      const balconyGeometry = new THREE.BoxGeometry(
        BUILDING_WIDTH + 0.6,
        0.12,
        BUILDING_DEPTH + 0.6,
      );
      const balconyMaterial = new THREE.MeshStandardMaterial({
        color: 0xe0e0e0,
        roughness: 0.8,
        transparent: true,
        opacity: 1.0,
        name: "balcony", // マテリアル名を追加
      });
      const balcony = new THREE.Mesh(balconyGeometry, balconyMaterial);
      balcony.position.y = i * FLOOR_HEIGHT + 0.06;
      buildingParts.add(balcony);

      // 手すり（ガラス風）
      const glassGeometry = new THREE.BoxGeometry(
        BUILDING_WIDTH + 0.4,
        0.3,
        0.08,
      );
      const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0x99ccff,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        metalness: 0.5,
        name: "glass", // マテリアル名を追加
      });
      // 前面
      const glassFront = new THREE.Mesh(glassGeometry, glassMaterial);
      glassFront.position.set(
        0,
        i * FLOOR_HEIGHT + 0.22,
        (BUILDING_DEPTH + 0.34) / 2,
      );
      buildingParts.add(glassFront); // グループに追加

      // 背面
      const glassBack = new THREE.Mesh(glassGeometry, glassMaterial);
      glassBack.position.set(
        0,
        i * FLOOR_HEIGHT + 0.22,
        -(BUILDING_DEPTH + 0.34) / 2,
      );
      buildingParts.add(glassBack); // グループに追加

      // 左右
      const glassSideGeometry = new THREE.BoxGeometry(
        0.08,
        0.3,
        BUILDING_DEPTH + 0.4,
      );
      // 右
      const glassRight = new THREE.Mesh(glassSideGeometry, glassMaterial);
      glassRight.position.set(
        (BUILDING_WIDTH + 0.34) / 2,
        i * FLOOR_HEIGHT + 0.22,
        0,
      );
      buildingParts.add(glassRight); // グループに追加

      // 左
      const glassLeft = new THREE.Mesh(glassSideGeometry, glassMaterial);
      glassLeft.position.set(
        -(BUILDING_WIDTH + 0.34) / 2,
        i * FLOOR_HEIGHT + 0.22,
        0,
      );
      buildingParts.add(glassLeft); // グループに追加

      // 窓（各階に複数配置）
      const windowGeometry = new THREE.BoxGeometry(0.9, 0.7, 0.05);
      const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x87bde6,
        roughness: 0.2,
        metalness: 0.6,
        transparent: true,
        opacity: 0.7,
        name: "window", // マテリアル名を追加
      });
      for (let w = -2; w <= 2; w++) {
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
        windowMesh.position.set(
          w * 1.6,
          i * FLOOR_HEIGHT + 0.6,
          BUILDING_DEPTH / 2 + 0.03,
        );
        buildingParts.add(windowMesh); // グループに追加
      }
    }

    // グレーの縦ライン（外観アクセント）
    const accentGeometry = new THREE.BoxGeometry(0.18, BUILDING_HEIGHT, 0.18);
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.5,
    });
    for (let a = -3; a <= 3; a += 2) {
      const accent = new THREE.Mesh(accentGeometry, accentMaterial);
      accent.position.set(
        a * 1.1,
        BUILDING_HEIGHT / 2,
        BUILDING_DEPTH / 2 + 0.12,
      );
      buildingParts.add(accent); // グループに追加
    }

    // エレベーターの3Dモデルをグループとして作成（キャビンと扉）
    const elevatorGroup = new THREE.Group();
    scene.add(elevatorGroup);

    // エレベーターのキャビン（本体部分）
    const elevatorCabinGeometry = new THREE.BoxGeometry(
      1.2,
      FLOOR_HEIGHT * 0.9,
      1.2,
    );
    const elevatorCabinMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00, // 初期は緑色
      roughness: 0.3,
      metalness: 0.5,
    });
    const elevatorCabin = new THREE.Mesh(
      elevatorCabinGeometry,
      elevatorCabinMaterial,
    );
    elevatorGroup.add(elevatorCabin);

    // エレベーターの左扉
    const leftDoorGeometry = new THREE.BoxGeometry(
      0.6,
      FLOOR_HEIGHT * 0.8,
      0.1,
    );
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.2,
      metalness: 0.8,
    });
    const leftDoor = new THREE.Mesh(leftDoorGeometry, doorMaterial);
    leftDoor.position.set(-0.3, 0, 0.65); // 初期位置は閉じている
    elevatorGroup.add(leftDoor);

    // エレベーターの右扉
    const rightDoorGeometry = new THREE.BoxGeometry(
      0.6,
      FLOOR_HEIGHT * 0.8,
      0.1,
    );
    const rightDoor = new THREE.Mesh(rightDoorGeometry, doorMaterial);
    rightDoor.position.set(0.3, 0, 0.65); // 初期位置は閉じている
    elevatorGroup.add(rightDoor);

    // エレベーターグループの初期位置
    elevatorGroup.position.y = FLOOR_HEIGHT / 2;

    // エレベーターの状態
    let elevatorStatus = "STOPPED";
    const doorAnimation = {
      isAnimating: false,
      openAmount: 0, // 0: 閉じている、1: 開いている
      targetOpenAmount: 0,
    };

    // 各フロアの高さを計算する関数
    const calculateFloorHeight = (floor: number): number => {
      // フロアは1から始まるので、計算時に調整（例：1階は建物の最下層）
      return (floor - 1) * FLOOR_HEIGHT + FLOOR_HEIGHT / 2;
    };

    // エレベーターの動作ロジック
    let targetFloor = calculateFloorHeight(1); // 初期フロアは1階
    const moveElevator = (floor: number) => {
      // フロア番号から実際の高さを計算
      targetFloor = calculateFloorHeight(floor);
      // 移動中の状態に設定
      elevatorStatus = "MOVING";
      // エレベーターカラーを更新（移動中は緑）
      elevatorCabinMaterial.color.set(0x00ff00);
    };

    // エレベーターのアクションを設定する関数
    const setElevatorAction = (action: string) => {
      elevatorStatus = action;

      switch (action) {
        case "OPENING_DOORS":
          doorAnimation.isAnimating = true;
          doorAnimation.targetOpenAmount = 1;
          break;
        case "CLOSING_DOORS":
          doorAnimation.isAnimating = true;
          doorAnimation.targetOpenAmount = 0;
          break;
        case "DOORS_OPEN":
          doorAnimation.openAmount = 1;
          doorAnimation.isAnimating = false;
          break;
        case "STOPPED":
          // 停止状態にはエレベーターを赤色に
          elevatorCabinMaterial.color.set(0xff0000);
          break;
        case "MOVING":
          // 移動中は緑色
          elevatorCabinMaterial.color.set(0x00ff00);
          break;
      }
    };

    // ビルの透明度を設定する関数
    const setBuildingTransparency = (opacity: number) => {
      buildingParts.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // マテリアル名に基づいて透明度を調整
          if (child.material.name === "glass") {
            // ガラス部分は元々透明なので元の透明度を維持しつつ調整
            child.material.opacity = Math.min(0.35, opacity + 0.1);
          } else if (child.material.name === "window") {
            // 窓も元々半透明なので調整
            child.material.opacity = Math.min(0.7, opacity + 0.2);
          } else {
            // その他の部分は指定された透明度を適用
            child.material.opacity = opacity;
          }

          // 透明度が1未満のときは透明設定を有効に
          child.material.transparent = opacity < 0.99;
        }
      });
    };

    // アニメーションループ内でエレベーターを動かす
    const animate = () => {
      requestAnimationFrame(animate);

      // エレベーターの位置を更新
      if (
        elevatorGroup.position.y !== targetFloor &&
        elevatorStatus === "MOVING"
      ) {
        const direction = targetFloor > elevatorGroup.position.y ? 0.05 : -0.05; // 速度を調整
        elevatorGroup.position.y =
          Math.abs(targetFloor - elevatorGroup.position.y) < 0.05
            ? targetFloor
            : elevatorGroup.position.y + direction;

        // エレベーター移動中はビルを透明に
        setBuildingTransparency(0.25);
      } else if (
        elevatorGroup.position.y === targetFloor &&
        elevatorStatus === "MOVING"
      ) {
        // 目的階に到着したらドアを開ける
        setElevatorAction("OPENING_DOORS");

        // 一定時間後にドアを開いた状態にし、さらに一定時間後に閉める
        setTimeout(() => {
          setElevatorAction("DOORS_OPEN");

          setTimeout(() => {
            setElevatorAction("CLOSING_DOORS");

            setTimeout(() => {
              setElevatorAction("STOPPED");
            }, 2000); // ドアを閉めるのにかかる時間
          }, 3000); // ドアを開いている時間
        }, 2000); // ドアを開けるのにかかる時間
      }

      // ドアのアニメーション
      if (doorAnimation.isAnimating) {
        if (doorAnimation.targetOpenAmount > doorAnimation.openAmount) {
          // ドアを開く
          doorAnimation.openAmount += 0.02;
          if (doorAnimation.openAmount >= doorAnimation.targetOpenAmount) {
            doorAnimation.openAmount = doorAnimation.targetOpenAmount;
            doorAnimation.isAnimating = false;
          }
        } else if (doorAnimation.targetOpenAmount < doorAnimation.openAmount) {
          // ドアを閉じる
          doorAnimation.openAmount -= 0.02;
          if (doorAnimation.openAmount <= doorAnimation.targetOpenAmount) {
            doorAnimation.openAmount = doorAnimation.targetOpenAmount;
            doorAnimation.isAnimating = false;
          }
        }

        // ドアの位置を更新
        leftDoor.position.x = -0.3 - doorAnimation.openAmount * 0.5;
        rightDoor.position.x = 0.3 + doorAnimation.openAmount * 0.5;
      }

      // カメラとビルの距離に応じた透明度の設定
      // ビルの中心点（ビルの位置）
      const buildingCenter = new THREE.Vector3(0, BUILDING_HEIGHT / 2, 0);
      // カメラとビルの距離を計算
      const distanceToBuilding = camera.position.distanceTo(buildingCenter);

      // 距離に応じた透明度の閾値
      const MIN_DISTANCE = 15; // この距離以下では完全不透明
      const MAX_DISTANCE = 30; // この距離以上では最も透明

      // エレベーターが移動中でない場合にのみ、距離に応じた透明度を適用
      if (elevatorStatus !== "MOVING") {
        if (distanceToBuilding > MIN_DISTANCE) {
          // 距離に応じた透明度の計算（MIN_DISTANCEからMAX_DISTANCEの間で線形に変化）
          const transparency = Math.min(
            0.3 +
              ((distanceToBuilding - MIN_DISTANCE) /
                (MAX_DISTANCE - MIN_DISTANCE)) *
                0.6,
            0.9,
          );

          // 視点が遠い場合はビルを半透明に
          if (distanceToBuilding > MAX_DISTANCE) {
            setBuildingTransparency(0.2); // 最大の透明度
          } else {
            setBuildingTransparency(1 - transparency); // 距離に応じた透明度
          }
        } else {
          // 近い場合は完全不透明
          setBuildingTransparency(1.0);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // グローバル関数としてエクスポート
    (
      window as typeof window & {
        moveElevator: (floor: number) => void;
        setElevatorAction: (action: string) => void;
      }
    ).moveElevator = moveElevator;

    (
      window as typeof window & {
        moveElevator: (floor: number) => void;
        setElevatorAction: (action: string) => void;
      }
    ).setElevatorAction = setElevatorAction;

    // リサイズ対応
    const handleResize = () => {
      if (!mountRef.current) return;

      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight,
      );
    };
    window.addEventListener("resize", handleResize);

    // クリーンアップ
    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}
