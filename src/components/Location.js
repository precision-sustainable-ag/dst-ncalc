import {useDispatch} from 'react-redux';
import Map from './GoogleMaps';
import {sets} from '../store/Store';

const Location = ({props, set, parms}) => {
  const dispatch = useDispatch();
  return (
    <>
      <h1>Where is your field located?</h1>
      <p>
        Enter your field's address.
        You can then zoom in and click to pinpoint it on the map.
      </p>
      
      <Map set={set} parms={parms} props={props} field autoFocus />
      
      <div className="bn">
        <button onClick={() => dispatch(sets.screen('Home'))}>BACK</button>
        <button onClick={() => dispatch(sets.screen('Soil'))}>NEXT</button>
      </div>
    </>
  )
} // Location

export default Location;