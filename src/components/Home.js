const Home = ({setScreen}) => (
  <div className="home">
    <p>Welcome to the</p>
    <h1>Cover Crop N Availability Calculator</h1>

    <p>This calculator aids farmers with decision support regarding cover crop residue persistence, as well as the amount and timing of nitrogen availability.</p>

    <div>
      <button onClick={() => setScreen('About'   ) }>ABOUT</button>
      <button onClick={() => setScreen('Location') }>GET STARTED</button>
    </div>

    <img className="crops fullwidth" src="background.png" alt="" />
  </div>
) // Home

export default Home;