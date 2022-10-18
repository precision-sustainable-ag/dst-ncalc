import {Input} from '../../shared/Inputs';
import {Button} from '@mui/material';
import {useSelector, useDispatch} from 'react-redux';
import {get, set} from '../../store/Store';

import './index.css';

const Feedback = () => {
  const dispatch = useDispatch();
  const BD = useSelector(get.BD);
  const OM = useSelector(get.OM);
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);

  const field = useSelector(get.field);
  const targetN = useSelector(get.targetN);
  const coverCrop = useSelector(get.coverCrop);
  const killDate = useSelector(get.killDate);
  const cashCrop = useSelector(get.cashCrop);
  const plantingDate = useSelector(get.plantingDate);

  const N = useSelector(get.N);
  const InorganicN = useSelector(get.InorganicN);
  const carb = useSelector(get.carb);
  const cell = useSelector(get.cell);
  const lign = useSelector(get.lign);
  const lwc = useSelector(get.lwc);
  const biomass = useSelector(get.biomass);
  const Yield = useSelector(get.yield);

  const feedback = useSelector(get.feedback);
  const name = useSelector(get.name);
  const email = useSelector(get.email);

  const submit = (e) => {
    if (!feedback.trim()) {
      alert('Please enter Feedback before submitting.');
      return
    } else if (!name.trim()) {
      alert('Please enter Name before submitting.');
      return;
    } else if (!email.trim()) {
      alert('Please enter Email before submitting.');
      return;
    }

    e.target.disabled = true;

    fetch(
      'https://weather.aesl.ces.uga.edu/cc-ncalc/feedback',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          feedback: `
Name: ${name.replace(/"/g, '')}
Email: ${email.replace(/"/g, '')}
Feedback:
${feedback.replace(/"/g, '')}
__________________________________
field        : ${field.replace(/"/g, '')}
targetN      : ${targetN}
coverCrop    : ${coverCrop}
killDate     : ${killDate}
cashCrop     : ${cashCrop}
plantingDate : ${plantingDate}
lat          : ${lat}
lon          : ${lon}
N            : ${N}
InorganicN   : ${InorganicN}
carb         : ${carb}
cell         : ${cell}
lign         : ${lign}
lwc          : ${lwc}
biomass      : ${biomass}
OM           : ${OM}
BD           : ${BD}
yield        : ${Yield}
__________________________________
          `
        }),
      })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        e.target.disabled = false;
        alert(`
          Thank you for the feedback!
          We will contact you if we have any updates or questions.
        `);
        console.log(JSON.stringify(data, null, 2));
      });
  } // submit

  return (
    <div className="feedback">
      <h2>CC-NCALC Feedback</h2>
      <br/>

      <p>
        Please provide any comments or suggestions that will help us improve the tool.<br/>
        Include any difficulties you may have encountered while running the program.
        <br/><br/>
      </p>

      <p>
        Note that your inputs will be sent to us along with your feedback, in order to help us troubleshoot.
        Please delete any personal information that you do not wish to share with us.
        <span style={{display: 'none'}}>You can attach a screenshot of your feedback below.</span>
      </p>

      <div
        id="Feedback"
        contentEditable
        placeholder="Enter comments here"
        dangerouslySetInnerHTML={{ __html: feedback }}
        onBlur={(e) => dispatch(set.feedback(e.currentTarget.innerText.replace(/[\n\r]/g, '<br>')))}
      />

      <div>
        <p>Name</p>
        <Input id="name" />

        <p>Email</p>
        <Input type="email" id="email" />

        <br/>
        <br/>
        <div>
          <Button
            variant="contained"
            onClick={(e) => submit(e)}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
} // Feedback
  
Feedback.desc = 'FEEDBACK';

export default Feedback;