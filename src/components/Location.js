import Map from './GoogleMaps';

const Location = ({props, set, parms, setScreen}) => (
  <>
    <h1>Where is your field located?</h1>
    <p>
      Enter your field's address.
      You can then zoom in and click to pinpoint it on the map.
    </p>
    
    <Map set={set} parms={parms} props={props} field autoFocus />
    
    <div className="bn">
      <button onClick={() => setScreen('Home')}>BACK</button>
      <button onClick={() => setScreen('Soil')}>NEXT</button>
    </div>
  </>
) // Location

export default Location;