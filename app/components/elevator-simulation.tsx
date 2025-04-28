import ElevatorControls from "@/app/components/elevator-controls";
import FloorSelector from "@/app/components/floor-selector";
import ThreeViewer from "@/app/components/three-viewer";

export default function ElevatorSimulation() {
  return (
    <div className="w-full h-screen flex flex-col md:flex-row">
      <div className="flex-grow">
        <ThreeViewer />
      </div>
      <div className="w-full md:w-80 bg-gray-100 p-4">
        <ElevatorControls />
        <FloorSelector />
      </div>
    </div>
  );
}
