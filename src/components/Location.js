import {useDispatch} from 'react-redux';
import Map from './GoogleMaps';
import {set} from '../store/Store';

const Location = () => {
  const dispatch = useDispatch();
  return (
    <>
      <Map field autoFocus />
      
      <div className="bn">
        <button onClick={() => dispatch(set.screen('Home'))}>BACK</button>
        <button onClick={() => dispatch(set.screen('Soil'))}>NEXT</button>
      </div>
    </>
  )
} // Location

export default Location;