const Home = ({setScreen, set, parms}) => {
  const className = parms.privacy ? 'home background' : 'home';

  return (
    <>
      <div
        className={className}
      >
        <p>Welcome to the</p>
        <h1>Cover Crop Nitrogen Calculator (CC-NCALC)</h1>

        <p>This calculator aids farmers with decision support regarding cover crop residue persistence, as well as the amount and timing of nitrogen availability.</p>

        <div>
          <button onClick={() => setScreen('About'   ) }>ABOUT</button>
          <button onClick={() => setScreen('Location') }>GET STARTED</button>
        </div>

        <img className="crops fullwidth" src="background.png" alt="" />
      </div>

      <div>
        <button
          id="Privacy"
          className="bn"
          onClick={() => set.privacy(!parms.privacy)}
        >
          Your privacy
        </button>
        {
          parms.privacy && 
          <div id="PrivacyPolicy">
            <button
              className="close"
              onClick={() => set.privacy(false)}
            >
              x
            </button>
            <p>Your information is stored on your computer only.  It will not be uploaded to a server.</p>
            <p>If you enter a fieldname, you can select it from the upper-right drop down list the next time you run the program.</p>
            <p>If you clear your browser's cache, you'll need to re-enter your data the next time you run the program.</p>
          </div>
        }
      </div>
    </>
  )
} // Home

export default Home;