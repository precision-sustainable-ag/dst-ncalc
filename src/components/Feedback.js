import {Input} from './Inputs';
import { Button } from '@mui/material';

const Feedback = ({set, parms, props}) => {
  const submit = (e) => {
    if (!parms.feedback.trim()) {
      alert('Please enter Feedback before submitting.');
      return
    } else if (!parms.name.trim()) {
      alert('Please enter Name before submitting.');
      return;
    } else if (!parms.email.trim()) {
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
Name: ${parms.name.replace(/"/g, '')}
Email: ${parms.email.replace(/"/g, '')}
Feedback:
${parms.feedback.replace(/"/g, '')}
__________________________________
field        : ${parms.field.replace(/"/g, '')}
targetN      : ${parms.targetN}
coverCrop    : ${parms.coverCrop}
killDate     : ${parms.killDate}
cashCrop     : ${parms.cashCrop}
plantingDate : ${parms.plantingDate}
lat          : ${parms.lat}
lon          : ${parms.lon}
N            : ${parms.N}
InorganicN   : ${parms.InorganicN}
carb         : ${parms.carb}
cell         : ${parms.cell}
lign         : ${parms.lign}
lwc          : ${parms.lwc}
biomass      : ${parms.biomass}
OM           : ${parms.OM}
BD           : ${parms.BD}
yield        : ${parms.yield}
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
        dangerouslySetInnerHTML={{ __html: parms.feedback }}
        onBlur={(e) => set.feedback(e.currentTarget.innerText.replace(/[\n\r]/g, '<br>'))}
      />

      <div>
        <p>Name</p>
        <Input {...props('name')} />

        <p>Email</p>
        <Input type="email" {...props('email')} />

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
  
export default Feedback;