const About = ({setScreen}) => (
  <div className="about">
    <h1>About</h1>

    <p>Cover crops can provide nitrogen (N) to the following cash crops by scavenging N in the soil or, in the case of legumes, by fixing N from the atmosphere. However, some cover crops can reduce the available N to following cash crops by immobilization. It can be difficult to know how much available N a cover crop will provide or if it will immobilize N. The amount of available N depends on the amount of biomass and the cover crop quality as well as soil temperature and moisture conditions. This calculator was developed to help provide guidance for N management when using cover crops.</p>

    <p>What to Expect from the Nitrogen Calculator:</p>
    <p>This calculator will predict how much and when nitrogen will be available from aboveground cover crop biomass.</p>
    <ul>
      <li>If the calculator gives you a <strong>positive number</strong>, this is a <strong>N credit</strong>, which can be subtracted from your target N fertilizer rate.</li>
      <li>If the calculator gives you a <strong>negative number</strong>, this is a <strong>N debit</strong>, and you should add additional N fertilizer at planting to account for the N immobilized by the cover crop.</li>
    </ul>
    <p>You will need to have measured cover crop biomass in your field and have an analysis of the cover crop nitrogen, carbohydrates, cellulose and lignin to use this calculator.</p>
    
    <div className="center">
      <button onClick={() => setScreen('Location')}>GET STARTED</button>
    </div>

    <img className="fullwidth" src="8-crops 1.png" alt="" />
  </div>
) // About

export default About;