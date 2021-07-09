import moment from 'moment';

import {Typography} from '@material-ui/core';

const Screen3 = ({parms}) => (
  <>
    <Typography variant="h5">
      Is this information correct?
    </Typography>
    <table>
      <tbody>
        <tr><td>Name                                 </td><td><strong>{parms.name}</strong></td></tr>
        <tr><td>Field Name                           </td><td><strong>{parms.field}</strong></td></tr>
        <tr><td>Sample ID                            </td><td><strong>{parms.sample}</strong></td></tr>
        <tr><td>Cash Crop                            </td><td><strong>{parms.crop}</strong></td></tr>
        <tr><td>Cash Crop Planting Date              </td><td><strong>{moment(parms.plantingDate).format('MM/DD/yyyy')}</strong></td></tr>
        <tr><td>Target Nitrogen Fertilizer Rate      </td><td><strong>{parms.targetN}</strong> lbs/A</td></tr>
        <tr><td>Cover Crop                           </td><td><strong>{parms.CoverCrop}</strong></td></tr>
        <tr><td>Cover Crop Termination Date          </td><td><strong>{moment(parms.coverCropDate).format('MM/DD/yyyy')}</strong></td></tr>
        <tr><td>High Organic Matter Soil             </td><td><strong>{parms.highOM}</strong></td></tr>
        <tr><td>Cover crop residue was               </td><td><strong>{parms.nutrient}</strong></td></tr>
        <tr><td>Dry Cover Crop Biomass               </td><td><strong>{parms.biomass}</strong> lbs/A</td></tr>
        <tr><td>Nitrogen in Cover Crop               </td><td><strong>{parms.N}</strong> %</td></tr>
        <tr><td>InitialFOMN                          </td><td><strong>{parms.InitialFOMN}</strong></td></tr>
        <tr><td>Carbohydrates in Cover Crop          </td><td><strong>{parms.carb}</strong> %</td></tr>
        <tr><td>Cellulose in Cover Crop              </td><td><strong>{parms.cellulose}</strong> %</td></tr>
        <tr><td>Lignin in Cover Crop                 </td><td><strong>{parms.lignin}</strong> %</td></tr>
      </tbody>
    </table>
  </>
) // Screen3

export default Screen3;