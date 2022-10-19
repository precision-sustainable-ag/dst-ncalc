import Map from '../../shared/GoogleMaps';
import {Link} from 'react-router-dom';

const Location = () => {
  return (
    <>
      <Map field autoFocus />

      <div className="bn">
        <Link className="link" to={'/home'}>BACK</Link>
        <Link className="link" to={'/soil'}>NEXT</Link>
      </div>
    </>
  )
} // Location

export default Location;