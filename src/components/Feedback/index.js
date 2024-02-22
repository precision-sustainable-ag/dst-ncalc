/* eslint-disable no-alert */
import React from 'react';
import {
  Box,
  Button,
  Modal,
  Paper,
  Typography,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import Input from '../../shared/Inputs';
import { get, set } from '../../store/Store';
import NavButton from '../../shared/Navigate/NavButton';

import './styles.scss';

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

  const submit = (e) => {
    if (!feedback.trim()) {
      alert('Please enter Feedback before submitting.');
      return;
    } if (!name.trim()) {
      alert('Please enter Name before submitting.');
      return;
    } if (!email.trim()) {
      alert('Please enter Email before submitting.');
      return;
    }

    e.target.disabled = true;

    fetch(
      'https://api.precisionsustainableag.org/cc-ncalc/feedback',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
          `,
        }),
      },
    )
      .then((response) => response.json())
      .then(() => {
        e.target.disabled = false;
        alert(`
          Thank you for the feedback!
          We will contact you if we have any updates or questions.
        `);
      });
  }; // submit

  return (
    <Modal
      open={openFeedbackModal}
      onClose={handleCloseModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      style={{
        display: 'flex',
        top: '0%',
        left: '10%',
        width: '80vw',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper>
        <Box
          sx={{
            padding: '0rem 2rem',
            overflow: 'auto',
            fontFamily: 'monospace !important',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              minWidth: '100%',
              justifyContent: 'flex-end',
              maxHeight: 'auto',
              p: 0,
              m: 0,
              marginLeft: '2rem',
            }}
          >
            <Button size="small" onClick={handleCloseModal}>
              <CancelPresentationIcon sx={{ fontSize: '2rem' }} />
            </Button>
          </Box>
          <Typography pb="1rem" sx={{ fontSize: '1.2rem', fontWeight: 700 }}>CC-NCALC Feedback</Typography>

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
          <div
            id="Feedback"
            contentEditable
            placeholder="Enter comments here"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: feedback }}
            onBlur={(e) => dispatch(set.feedback(e.currentTarget.innerText.replace(/[\n\r]/g, '<br>')))}
          />
          <Box>
            <Typography>Name</Typography>
            <Input id="name" />
            <Typography>Email</Typography>
            <Input type="email" id="email" />
            <Box py="1rem">
              <NavButton onClick={(e) => submit(e)}>
                Submit
              </NavButton>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
}; // Feedback

Feedback.desc = 'FEEDBACK';

export default Feedback;
