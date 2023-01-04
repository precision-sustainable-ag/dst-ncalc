import Map from "../../shared/GoogleMaps";
import { Link } from "react-router-dom";

const Location = () => {
  return (
    <div
      style={{
        justifyContent: "center",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="map-div">
        <Map field autoFocus />
      </div>

      <div className="bn">
        <Link className="link" to={"/home"}>
          BACK
        </Link>
        <Link className="link" to={"/soil"}>
          NEXT
        </Link>
      </div>
    </div>
  );
}; // Location

export default Location;
