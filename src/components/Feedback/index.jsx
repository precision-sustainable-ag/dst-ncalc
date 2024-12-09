import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Paper, Box, Button, Typography } from '@mui/material';
import { PSAModal } from 'shared-react-components/src';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import { get, set } from '../../store/Store';
import { PSAForm } from 'shared-react-components/src';

const Feedback = () => {
  const dispatch = useDispatch();

  const BD = useSelector(get.BD);
  const OM = useSelector(get.OM);
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);

  const field = useSelector(get.field);
  const targetN = useSelector(get.targetN);
  const coverCrop = useSelector(get.coverCrop);
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const cashCrop = useSelector(get.cashCrop);
  const cashCropPlantingDate = useSelector(get.cashCropPlantingDate);

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

  const openFeedbackModal = useSelector(get.openFeedbackModal);
  const handleCloseModal = () => dispatch(set.openFeedbackModal(false));

  const fields = [
    {
      name: 'feedback',
      label: 'Feedback',
      type: 'text',
      required: true,
      description: 'Enter your feedback or suggestions.',
      props: {
        placeholder: 'Provide your feedback here',
        multiline: true,
        rows: 4,
        fullWidth: true
      },
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      description: 'Enter your name.',
      props: { placeholder: 'Your name' },
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      required: true,
      description: 'Enter your email address.',
      props: { placeholder: 'Your email' },
    },
  ];

  const submitFeedback = (formData) => {
    const comments = `
      ${formData.feedback}
      __________________________________
      field        : ${field}
      targetN      : ${targetN}
      coverCrop    : ${coverCrop}
      killDate     : ${coverCropTerminationDate}
      cashCrop     : ${cashCrop}
      plantingDate : ${cashCropPlantingDate}
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
    `;

    const requestPayload = {
      repository: 'dst-feedback',
      title: 'Feedback',
      name: formData.name,
      email: formData.email,
      comments,
      labels: ['cc-ncalc'],
    };

    fetch('https://developfeedback.covercrop-data.org/v1/issues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    })
      .then((response) => response.json())
      .then((body) => {
        if (body.data.status === 'success') {
          alert(`
            Thank you for the feedback!
            We will contact you if we have any updates or questions.
          `);
        } else {
          alert('Failed to send Feedback to Github.');
        }
      })
      .catch(() => alert('Failed to send Feedback to Github.'));
  };

  return (
    <PSAModal
      open={openFeedbackModal}
      onClose={handleCloseModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      modalContent={
      <Paper style={{ width: '80vw', maxHeight: '90vh', overflow: 'auto' }}>
        <Box sx={{ padding: '2rem', fontFamily: 'monospace !important' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="small" onClick={handleCloseModal}>
              <CancelPresentationIcon sx={{ fontSize: '2rem' }} />
            </Button>
          </Box>
          <Typography pb="1rem" sx={{ fontSize: '1.2rem', fontWeight: 700 }}>
            CC-NCALC Feedback
          </Typography>
          <Typography variant="feedback">
            Please provide any comments or suggestions that will help us improve the tool.
          </Typography>
          <Typography variant="feedback" pb="1rem">
            Include any difficulties you may have encountered while running the program.
          </Typography>

          <Typography variant="feedback">
            Note that your inputs will be sent to us along with your feedback, in order to help us troubleshoot.
            Please delete any personal information that you do not wish to share with us.
            <span style={{ display: 'none' }}>You can attach a screenshot of your feedback below.</span>
          </Typography>
          <PSAForm
            submitMessage="Thank you for the feedback! We will contact you if we have any updates or questions."
            repository="dst-feedback"
            fields={fields}
            buttons={[
              {
                action: "submit",
                props: { title: 'Submit', variant: 'contained', color: 'primary', children: 'Submit' }, 
              },
            ]}
            handleSubmit={submitFeedback}
          />
        </Box>
      </Paper>
      }
    />

  );
};

export default Feedback;
