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
Name: ${parms.name}
Email: ${parms.email}
Feedback:
${parms.feedback}
          `
        }),
      })
      .then(response => response.json())
      .then(data => {
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
        Explain your feedback as thoroughly as you can.<br/>
        Your feedback will help us improve the CC-NCALC experience.
        <span style={{display: 'none'}}>You can attach a screenshot of your feedback below.</span>
      </p>

      <div
        id="Feedback"
        contentEditable
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