import ElevatorControls from "@/app/components/elevator-controls";
import ElevatorHistory from "@/app/components/elevator-history";
import FloorSelector from "@/app/components/floor-selector";
import { ThreeViewer } from "@/app/components/three-viewer/three-viewer";

export default function ElevatorSimulation() {
  return (
    <div className="w-full h-screen flex flex-col md:flex-row">
      <div className="flex-grow">
        <ThreeViewer />
      </div>
      <div className="w-full md:w-96 lg:w-112 xl:w-128 bg-gray-100 p-4 overflow-y-auto">
        <ElevatorControls />
        <div className="my-4" />
        <FloorSelector />
        <div className="my-4" />
        <ElevatorHistory />
      </div>
    </div>
  );
}
