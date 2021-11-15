const transpile = ({FOMkg, FOMpctN, FOMpctCarb, FOMpctCell, FOMpctLign, LitterWaterContent, BD, INppm, hours, stop, temp, RH, rain}) => {
  const type = (FOMpctN >= 2.25) && (FOMpctCarb >= 50) ? 'Clover' : 'Rye';
  console.log(type);
  
  const DELAY = (parm, delay, def) => {
    let r;
  
    if (S[parm]) {
      r = S[parm][Math.max(0, t - delay)];
    } else {
      alert('DELAY: ' + parm);
    }
  
    return typeof r === 'undefined' ? def : r;
  } // DELAY
  
  const PREVIOUS = (parm, def) => DELAY(parm, 1, def);
  
  const LN  = Math.log;
  const EXP = Math.exp;
  const MAX = Math.max;
  const MIN = Math.min;
  
  const dt = 1;
  
  const S = {
    'FOMkg/ha': [],
    'FOM': [],
    'FOMpctCarb': [],
    'Carb': [],
    'FOMpctN': [],
    'InitialFOMN_kg/ha': [],
    'FOMpctLign': [],
    'NAllocationFactor': [],
    'CarbN': [],
    'FOMpctCell': [],
    'Cell': [],
    'CellN': [],
    'SOCpct': [],
    'BD': [],
    'Depth_in': [],
    'Depth_layer_cm': [],
    'Hum': [],
    'HumN': [],
    'INppm': [],
    'FAC': [],
    'INkg': [],
    'Lign': [],
    'LigninN': [],
    'LitterWaterContent': [],
    'MinNfromFOM': [],
    'MinNfromHum': [],
    'NImmobFromFOM': [],
    'NimmobIntoCarbN': [],
    'RH': RH,
    'Rain': rain,
    'Dew': [],
    'PrevLitWC': [],
    'PrevRH': [],
    'RHChange': [],
    'c': [],
    'Temp': temp,
    'k_4': [],
    'WaterLossFromEvap': [],
    'RainToGetCurrentWC': [],
    'WCFromRain': [],
    'FromRain': [],
    'FromDew': [],
    'Air_MPa': [],
    '%_lignin': [],
    'a': [],
    'b': [],
    'LitterMPa': [],
    'Litter_MPa_Gradient': [],
    'k1': [],
    'FromAir': [],
    'Evaporation': [],
    'CarbK': [],
    'RMTFAC': [],
    'FON': [],
    'CNR': [],
    'CNRF': [],
    'Critical_FOM': [],
    'ContactFactor': [],
    'DeCarb': [],
    'GrNom1': [],
    'k3': [],
    'CellK': [],
    'DeCell': [],
    'GRNom2': [],
    'LignK': [],
    'DeLign': [],
    'GRNOm3': [],
    'GRNom': [],
    'FractionHumified': [],
    'FOMNhum': [],
    'GRCom1': [],
    'GRCom2': [],
    'GRCom3': [],
    'GRCom': [],
    'Resistant': [],
    'PMNhotKCl': [],
    'Dminr': [],
    'HumMin': [],
    'RhMin': [],
    'NetMin': [],
    'RNAC': [],
    'MinFromFOMRate': [],
    'MinFromHumRate': [],
    'Noname_1': [],
    'Noname_2': [],
    'overall_%N': [],
    'Sat': []
  }

  let t = 0;
  if (type === 'Rye') {
    S['FOMkg/ha'] = FOMkg;
    S.FOM[t] = S.FOM[t + 1] = Math.max(0, S['FOMkg/ha']);
    S.FOMpctCarb = FOMpctCarb;
    S.Carb[t] = S.Carb[t + 1] = Math.max(0, S.FOM[t]*S.FOMpctCarb/100);
    S.FOMpctN = FOMpctN;
    S['InitialFOMN_kg/ha'] = S['FOMkg/ha']*S.FOMpctN/100;
    S.FOMpctLign = FOMpctLign;
    S.NAllocationFactor = 1;
    S.CarbN[t] = S.CarbN[t + 1] = Math.max(0, (S['InitialFOMN_kg/ha'])*S.FOMpctCarb/100);
    S.FOMpctCell = FOMpctCell;
    S.Cell[t] = S.Cell[t + 1] = Math.max(0, S.FOM[t]*S.FOMpctCell/100);
    S.CellN[t] = S.CellN[t + 1] = Math.max(0, ((S['InitialFOMN_kg/ha'])-(S['InitialFOMN_kg/ha']*S.FOMpctLign/100))-S.CarbN[t]);
    S.SOCpct = 1.95;
    S.BD = BD;
    S.Depth_in = 8;
    S.Depth_layer_cm = S.Depth_in*2.54;
    S.Hum[t] = S.Hum[t + 1] = Math.max(0, S.SOCpct*S.BD*S.Depth_layer_cm*1000/0.58);
    S.HumN[t] = S.HumN[t + 1] = Math.max(0, S.SOCpct*S.Depth_layer_cm*S.BD*100);
    S.INppm = INppm;
    S.FAC = S.BD*S.Depth_layer_cm*0.1;
    S.INkg[t] = S.INkg[t + 1] = Math.max(0, S.INppm*S.FAC);
    S.Lign[t] = S.Lign[t + 1] = Math.max(0, S.FOM[t]*S.FOMpctLign/100);
    S.LigninN[t] = S.LigninN[t + 1] = Math.max(0, S['InitialFOMN_kg/ha']*S.FOMpctLign/100);
    S.LitterWaterContent[t] = S.LitterWaterContent[t + 1] = LitterWaterContent;
    S.MinNfromFOM[t] = S.MinNfromFOM[t + 1] = Math.max(0, 0);
    S.MinNfromHum[t] = S.MinNfromHum[t + 1] = Math.max(0, 0);
    S.NImmobFromFOM[t] = S.NImmobFromFOM[t + 1] = Math.max(0, 0);
    S.NimmobIntoCarbN[t] = S.NimmobIntoCarbN[t + 1] = Math.max(0, 0);
    S.Dew[t] = S.Dew[t + 1] = ( (S.RH[t]>85) && (PREVIOUS('RH',  0)<85) ?  (S.Rain[t]===0) ? 1 : 0 : 0);
    S.PrevLitWC[t] = S.PrevLitWC[t + 1] = DELAY('LitterWaterContent',  1);
    S.PrevRH[t] = S.PrevRH[t + 1] = DELAY('RH',  1);
    S.RHChange[t] = S.RHChange[t + 1] = S.RH[t]-S.PrevRH[t];
    S.c = 0.01;
    S.k_4[t] = S.k_4[t + 1] = S.c*S.Temp[t]*S.LitterWaterContent[t];
    S.WaterLossFromEvap[t] = S.WaterLossFromEvap[t + 1] = (S.LitterWaterContent[t] <= 0.04) ? 0 :  (S.Dew[t] === 0) && (PREVIOUS('Dew',  0) > 0) ? 0.2 :  (S.Rain[t] === 0) && (PREVIOUS('Rain',  0) > 0) ? 0.7 :  (S.RHChange[t] >= 0) ? 0 :  (S.RHChange[t] > -2.5) ? 0.001 :  (S.k_4[t] > 0.03) ? 0.06 : S.k_4[t];
    S.RainToGetCurrentWC[t] = S.RainToGetCurrentWC[t + 1] = (S.Rain[t]>0) ? -1.6679+0.9724*EXP(0.9443*S.LitterWaterContent[t])+0.4956*EXP(0.9443*S.LitterWaterContent[t]) : 0;
    S.WCFromRain[t] = S.WCFromRain[t + 1] = (S.Rain[t]>0) ? 0.8523*(1-EXP(-0.9525*(S.Rain[t]+S.RainToGetCurrentWC[t])))+2.9558*(1-EXP(-0.0583*(S.Rain[t]+S.RainToGetCurrentWC[t]))) : 0;
    S.FromRain[t] = S.FromRain[t + 1] = Math.max(0, (S.Rain[t]>0) ?  (S.WCFromRain[t]-S.LitterWaterContent[t])>0.3 ? 0.3 : (S.WCFromRain[t]-S.LitterWaterContent[t]) : 0);
    S.FromDew[t] = S.FromDew[t + 1] = Math.max(0, (S.Dew[t]===1) && (S.LitterWaterContent[t]<2.5) ?  (S.FOM[t]>1500) ? 0.5 : 0 : 0);
    S.Air_MPa[t] = S.Air_MPa[t + 1] = (8.314*(S.Temp[t]+273.15)*LN(S.RH[t]/100)/(18*10**-6))/1000000;
    S['%_lignin'][t] = S['%_lignin'][t + 1] = MIN(13, (S.Lign[t] / S.FOM[t]) * 100);
    S.a[t] = S.a[t + 1] = -0.5981*S['%_lignin'][t]+8.1823;
    S.b[t] = S.b[t + 1] = -0.1181*S['%_lignin'][t]-0.3783;
    S.LitterMPa[t] = S.LitterMPa[t + 1] = MAX(-200, -S.a[t] * (S.LitterWaterContent[t] ** S.b[t]));
    S.Litter_MPa_Gradient[t] = S.Litter_MPa_Gradient[t + 1] = (S.Air_MPa[t]-S.LitterMPa[t]);
    S.k1[t] = S.k1[t + 1] = (S.RHChange[t]===0) ? 0 :  (S.RHChange[t]>0) && (S.Litter_MPa_Gradient[t]<30) ? 0.0008 :  (S.RHChange[t]>0) && (S.Litter_MPa_Gradient[t]>30) ? 0.0004 : 0;
    S.FromAir[t] = S.FromAir[t + 1] = ((S.RHChange[t]>0) && (S.Litter_MPa_Gradient[t]>0)) ?  (S.k1[t]*S.Litter_MPa_Gradient[t]>0.01) ? 0.026 : (S.k1[t]*S.Litter_MPa_Gradient[t]) : 0;
    S.Evaporation[t] = S.Evaporation[t + 1] = Math.max(0, (S.LitterWaterContent[t]-S.WaterLossFromEvap[t]) >0 ? S.WaterLossFromEvap[t] : 0);
    S.CarbK[t] = S.CarbK[t + 1] = 0.018* EXP(-12*(S['%_lignin'][t]/100));
    S.RMTFAC[t] = S.RMTFAC[t + 1] = S.Temp[t] < 0 ? 0 : (0.384+0.018*S.Temp[t])*EXP(S.LitterMPa[t]*(0.142+0.628*S.Temp[t]**-1));
    S.FON[t] = S.FON[t + 1] = S.CarbN[t]+S.CellN[t]+S.LigninN[t];
    S.CNR[t] = S.CNR[t + 1] = (0.426*S.FOM[t])/(S.FON[t]+S.INkg[t]);
    S.CNRF[t] = S.CNRF[t + 1] = MIN(1, EXP(-0.693 * (S.CNR[t] - 13) / 13));
    S.Critical_FOM = 1400;
    S.ContactFactor[t] = S.ContactFactor[t + 1] = (S.FOM[t]>3000) ? (S.Critical_FOM/3000) : MIN(1, S.Critical_FOM/S.FOM[t]);
    S.DeCarb[t] = S.DeCarb[t + 1] = S.CarbK[t]*S.RMTFAC[t]*S.CNRF[t]*S.ContactFactor[t];
    S.GrNom1[t] = S.GrNom1[t + 1] = Math.max(0, S.CarbN[t]*S.DeCarb[t]);
    S.k3 = 0.01;
    S.CellK[t] = S.CellK[t + 1] = S.k3* EXP(-12*(S['%_lignin'][t]/100));
    S.DeCell[t] = S.DeCell[t + 1] = S.CellK[t]*S.RMTFAC[t]*S.CNRF[t]*S.ContactFactor[t];
    S.GRNom2[t] = S.GRNom2[t + 1] = Math.max(0, S.CellN[t]*S.DeCell[t]);
    S.LignK = 0.00095;
    S.DeLign[t] = S.DeLign[t + 1] = S.LignK*S.RMTFAC[t]*S.CNRF[t]*S.ContactFactor[t];
    S.GRNOm3[t] = S.GRNOm3[t + 1] = Math.max(0, S.LigninN[t]*S.DeLign[t]);
    S.GRNom[t] = S.GRNom[t + 1] = S.GrNom1[t]+S.GRNom2[t]+S.GRNOm3[t];
    S.FractionHumified = 0.125;
    S.FOMNhum[t] = S.FOMNhum[t + 1] = Math.max(0, S.GRNom[t]*S.FractionHumified);
    S.GRCom1[t] = S.GRCom1[t + 1] = Math.max(0, S.Carb[t]*S.DeCarb[t]);
    S.GRCom2[t] = S.GRCom2[t + 1] = Math.max(0, S.Cell[t]*S.DeCell[t]);
    S.GRCom3[t] = S.GRCom3[t + 1] = Math.max(0, S.Lign[t]*S.DeLign[t]);
    S.GRCom[t] = S.GRCom[t + 1] = Math.max(0, S.GRCom1[t]+S.GRCom2[t]+S.GRCom3[t]);
    S.Resistant[t] = S.Resistant[t + 1] = Math.max(0, S.FractionHumified * S.GRNom[t] / 0.04);
    S.PMNhotKCl = 10;
    S.Dminr = ((((0.0024+0.022*S.PMNhotKCl)*(S.BD*S.Depth_layer_cm)/10)/0.66666)/0.70)*2/24;
    S.HumMin[t] = S.HumMin[t + 1] = Math.max(0, (S.Dminr*S.RMTFAC[t])/0.04);
    S.RhMin[t] = S.RhMin[t + 1] = Math.max(0, S.Dminr*S.RMTFAC[t]);
    S.NetMin[t] = S.NetMin[t + 1] = Math.max(0, S.RhMin[t]+(1-S.FractionHumified)*S.GRNom[t]);
    S.RNAC[t] = S.RNAC[t + 1] = Math.max(0, MIN(S.INkg[t], S.GRCom[t] * 0.0213 - S.GRNom[t]));
    S.MinFromFOMRate[t] = S.MinFromFOMRate[t + 1] = Math.max(0, S.GRNom[t]*(1-S.FractionHumified)-S.RNAC[t]);
    S.MinFromHumRate[t] = S.MinFromHumRate[t + 1] = Math.max(0, S.RhMin[t]);
    S.Noname_1[t] = S.Noname_1[t + 1] = Math.max(0, S.FOMNhum[t]);
    S.Noname_2[t] = S.Noname_2[t + 1] = Math.max(0, S.RNAC[t]);
    S['overall_%N'][t] = S['overall_%N'][t + 1] = (S.FON[t]/S.FOM[t])*100;
    S.Sat = (1-(S.BD/2.65))/S.BD;
    
    for (t = 1; t <= hours; t++) {
      S.FOM[t] = S.FOM[t + 1] = Math.max(0, S.FOM[t - dt] + ( - S.GRCom[t]) * dt);
      S.Carb[t] = S.Carb[t + 1] = Math.max(0, S.Carb[t - dt] + ( - S.GRCom1[t]) * dt);
      S.CarbN[t] = S.CarbN[t + 1] = Math.max(0, S.CarbN[t - dt] + (S.RNAC[t] - S.GrNom1[t]) * dt);
      S.Cell[t] = S.Cell[t + 1] = Math.max(0, S.Cell[t - dt] + ( - S.GRCom2[t]) * dt);
      S.CellN[t] = S.CellN[t + 1] = Math.max(0, S.CellN[t - dt] + ( - S.GRNom2[t]) * dt);
      S.Hum[t] = S.Hum[t + 1] = Math.max(0, S.Hum[t - dt] + (S.Resistant[t] - S.HumMin[t]) * dt);
      S.HumN[t] = S.HumN[t + 1] = Math.max(0, S.HumN[t - dt] + (S.FOMNhum[t] - S.RhMin[t]) * dt);
      S.INkg[t] = S.INkg[t + 1] = Math.max(0, S.INkg[t - dt] + (S.NetMin[t] - S.RNAC[t]) * dt);
      S.Lign[t] = S.Lign[t + 1] = Math.max(0, S.Lign[t - dt] + ( - S.GRCom3[t]) * dt);
      S.LigninN[t] = S.LigninN[t + 1] = Math.max(0, S.LigninN[t - dt] + ( - S.GRNOm3[t]) * dt);
      S.LitterWaterContent[t] = S.LitterWaterContent[t + 1] = Math.max(0, S.LitterWaterContent[t - dt] + (S.FromAir[t] + S.FromRain[t] + S.FromDew[t] - S.Evaporation[t]) * dt);
      S.MinNfromFOM[t] = S.MinNfromFOM[t + 1] = Math.max(0, S.MinNfromFOM[t - dt] + (S.MinFromFOMRate[t]) * dt);
      S.MinNfromHum[t] = S.MinNfromHum[t + 1] = Math.max(0, S.MinNfromHum[t - dt] + (S.MinFromHumRate[t]) * dt);
      S.NImmobFromFOM[t] = S.NImmobFromFOM[t + 1] = Math.max(0, S.NImmobFromFOM[t - dt] + (S.Noname_1[t]) * dt);
      S.NimmobIntoCarbN[t] = S.NimmobIntoCarbN[t + 1] = Math.max(0, S.NimmobIntoCarbN[t - dt] + (S.Noname_2[t]) * dt);
      S['InitialFOMN_kg/ha'] = S['FOMkg/ha']*S.FOMpctN/100;
      S.Depth_in = 8;
      S.Depth_layer_cm = S.Depth_in*2.54;
      S.BD = BD;
      S.FAC = S.BD*S.Depth_layer_cm*0.1;
      S.Dew[t] = S.Dew[t + 1] = ( (S.RH[t]>85) && (PREVIOUS('RH',  0)<85) ?  (S.Rain[t]===0) ? 1 : 0 : 0);
      S.PrevLitWC[t] = S.PrevLitWC[t + 1] = DELAY('LitterWaterContent',  1);
      S.PrevRH[t] = S.PrevRH[t + 1] = DELAY('RH',  1);
      S.RHChange[t] = S.RHChange[t + 1] = S.RH[t]-S.PrevRH[t];
      S.k_4[t] = S.k_4[t + 1] = S.c*S.Temp[t]*S.LitterWaterContent[t];
      S.WaterLossFromEvap[t] = S.WaterLossFromEvap[t + 1] = (S.LitterWaterContent[t] <= 0.04) ? 0 :  (S.Dew[t] === 0) && (PREVIOUS('Dew',  0) > 0) ? 0.2 :  (S.Rain[t] === 0) && (PREVIOUS('Rain',  0) > 0) ? 0.7 :  (S.RHChange[t] >= 0) ? 0 :  (S.RHChange[t] > -2.5) ? 0.001 :  (S.k_4[t] > 0.03) ? 0.06 : S.k_4[t];
      S.RainToGetCurrentWC[t] = S.RainToGetCurrentWC[t + 1] = (S.Rain[t]>0) ? -1.6679+0.9724*EXP(0.9443*S.LitterWaterContent[t])+0.4956*EXP(0.9443*S.LitterWaterContent[t]) : 0;
      S.WCFromRain[t] = S.WCFromRain[t + 1] = (S.Rain[t]>0) ? 0.8523*(1-EXP(-0.9525*(S.Rain[t]+S.RainToGetCurrentWC[t])))+2.9558*(1-EXP(-0.0583*(S.Rain[t]+S.RainToGetCurrentWC[t]))) : 0;
      S.FromRain[t] = S.FromRain[t + 1] = Math.max(0, (S.Rain[t]>0) ?  (S.WCFromRain[t]-S.LitterWaterContent[t])>0.3 ? 0.3 : (S.WCFromRain[t]-S.LitterWaterContent[t]) : 0);
      S.FromDew[t] = S.FromDew[t + 1] = Math.max(0, (S.Dew[t]===1) && (S.LitterWaterContent[t]<2.5) ?  (S.FOM[t]>1500) ? 0.5 : 0 : 0);
      S.Air_MPa[t] = S.Air_MPa[t + 1] = (8.314*(S.Temp[t]+273.15)*LN(S.RH[t]/100)/(18*10**-6))/1000000;
      S['%_lignin'][t] = S['%_lignin'][t + 1] = MIN(13, (S.Lign[t] / S.FOM[t]) * 100);
      S.a[t] = S.a[t + 1] = -0.5981*S['%_lignin'][t]+8.1823;
      S.b[t] = S.b[t + 1] = -0.1181*S['%_lignin'][t]-0.3783;
      S.LitterMPa[t] = S.LitterMPa[t + 1] = MAX(-200, -S.a[t] * (S.LitterWaterContent[t] ** S.b[t]));
      S.Litter_MPa_Gradient[t] = S.Litter_MPa_Gradient[t + 1] = (S.Air_MPa[t]-S.LitterMPa[t]);
      S.k1[t] = S.k1[t + 1] = (S.RHChange[t]===0) ? 0 :  (S.RHChange[t]>0) && (S.Litter_MPa_Gradient[t]<30) ? 0.0008 :  (S.RHChange[t]>0) && (S.Litter_MPa_Gradient[t]>30) ? 0.0004 : 0;
      S.FromAir[t] = S.FromAir[t + 1] = ((S.RHChange[t]>0) && (S.Litter_MPa_Gradient[t]>0)) ?  (S.k1[t]*S.Litter_MPa_Gradient[t]>0.01) ? 0.026 : (S.k1[t]*S.Litter_MPa_Gradient[t]) : 0;
      S.Evaporation[t] = S.Evaporation[t + 1] = Math.max(0, (S.LitterWaterContent[t]-S.WaterLossFromEvap[t]) >0 ? S.WaterLossFromEvap[t] : 0);
      S.RMTFAC[t] = S.RMTFAC[t + 1] = S.Temp[t] < 0 ? 0 : (0.384+0.018*S.Temp[t])*EXP(S.LitterMPa[t]*(0.142+0.628*S.Temp[t]**-1));
      S.FON[t] = S.FON[t + 1] = S.CarbN[t]+S.CellN[t]+S.LigninN[t];
      S.CNR[t] = S.CNR[t + 1] = (0.426*S.FOM[t])/(S.FON[t]+S.INkg[t]);
      S.CNRF[t] = S.CNRF[t + 1] = MIN(1, EXP(-0.693 * (S.CNR[t] - 13) / 13));
      S.Critical_FOM = 1400;
      S.ContactFactor[t] = S.ContactFactor[t + 1] = (S.FOM[t]>3000) ? (S.Critical_FOM/3000) : MIN(1, S.Critical_FOM/S.FOM[t]);
      S.CarbK[t] = S.CarbK[t + 1] = 0.018* EXP(-12*(S['%_lignin'][t]/100));
      S.DeCarb[t] = S.DeCarb[t + 1] = S.CarbK[t]*S.RMTFAC[t]*S.CNRF[t]*S.ContactFactor[t];
      S.GrNom1[t] = S.GrNom1[t + 1] = Math.max(0, S.CarbN[t]*S.DeCarb[t]);
      S.k3 = 0.01;
      S.CellK[t] = S.CellK[t + 1] = S.k3* EXP(-12*(S['%_lignin'][t]/100));
      S.DeCell[t] = S.DeCell[t + 1] = S.CellK[t]*S.RMTFAC[t]*S.CNRF[t]*S.ContactFactor[t];
      S.GRNom2[t] = S.GRNom2[t + 1] = Math.max(0, S.CellN[t]*S.DeCell[t]);
      S.LignK = 0.00095;
      S.DeLign[t] = S.DeLign[t + 1] = S.LignK*S.RMTFAC[t]*S.CNRF[t]*S.ContactFactor[t];
      S.GRNOm3[t] = S.GRNOm3[t + 1] = Math.max(0, S.LigninN[t]*S.DeLign[t]);
      S.GRNom[t] = S.GRNom[t + 1] = S.GrNom1[t]+S.GRNom2[t]+S.GRNOm3[t];
      S.FractionHumified = 0.125;
      S.FOMNhum[t] = S.FOMNhum[t + 1] = Math.max(0, S.GRNom[t]*S.FractionHumified);
      S.GRCom1[t] = S.GRCom1[t + 1] = Math.max(0, S.Carb[t]*S.DeCarb[t]);
      S.GRCom2[t] = S.GRCom2[t + 1] = Math.max(0, S.Cell[t]*S.DeCell[t]);
      S.GRCom3[t] = S.GRCom3[t + 1] = Math.max(0, S.Lign[t]*S.DeLign[t]);
      S.GRCom[t] = S.GRCom[t + 1] = Math.max(0, S.GRCom1[t]+S.GRCom2[t]+S.GRCom3[t]);
      S.Resistant[t] = S.Resistant[t + 1] = Math.max(0, S.FractionHumified * S.GRNom[t] / 0.04);
      S.Dminr = ((((0.0024+0.022*S.PMNhotKCl)*(S.BD*S.Depth_layer_cm)/10)/0.66666)/0.70)*2/24;
      S.HumMin[t] = S.HumMin[t + 1] = Math.max(0, (S.Dminr*S.RMTFAC[t])/0.04);
      S.RhMin[t] = S.RhMin[t + 1] = Math.max(0, S.Dminr*S.RMTFAC[t]);
      S.NetMin[t] = S.NetMin[t + 1] = Math.max(0, S.RhMin[t]+(1-S.FractionHumified)*S.GRNom[t]);
      S.RNAC[t] = S.RNAC[t + 1] = Math.max(0, MIN(S.INkg[t], S.GRCom[t] * 0.0213 - S.GRNom[t]));
      S.MinFromFOMRate[t] = S.MinFromFOMRate[t + 1] = Math.max(0, S.GRNom[t]*(1-S.FractionHumified)-S.RNAC[t]);
      S.MinFromHumRate[t] = S.MinFromHumRate[t + 1] = Math.max(0, S.RhMin[t]);
      S.Noname_1[t] = S.Noname_1[t + 1] = Math.max(0, S.FOMNhum[t]);
      S.Noname_2[t] = S.Noname_2[t + 1] = Math.max(0, S.RNAC[t]);
      S['overall_%N'][t] = S['overall_%N'][t + 1] = (S.FON[t]/S.FOM[t])*100;
      S.Sat = (1-(S.BD/2.65))/S.BD;
      S.NAllocationFactor = 1;
    }
    
    Object.keys(S).forEach(p => {
      if (S[p].length) {
        S[p] = S[p].slice(0, stop + 1);
      }
    });
  } else if (type === 'Clover') {
    S['FOMkg/ha'] = FOMkg;
    S.FOM[t] = S.FOM[t + 1] = Math.max(0, S['FOMkg/ha']);
    S.FOMpctCarb = FOMpctCarb;
    S.Carb[t] = S.Carb[t + 1] = Math.max(0, S.FOM[t]*S.FOMpctCarb/100);
    S.FOMpctN = FOMpctN;
    S['InitialFOMN_kg/ha'] = S['FOMkg/ha']*S.FOMpctN/100;
    S.FOMpctLign = FOMpctLign;
    S.NAllocationFactor = 1;
    S.CarbN[t] = S.CarbN[t + 1] = Math.max(0, (S['InitialFOMN_kg/ha'])*S.FOMpctCarb/100);
    S.FOMpctCell = FOMpctCell;
    S.Cell[t] = S.Cell[t + 1] = Math.max(0, S.FOM[t]*S.FOMpctCell/100);
    S.CellN[t] = S.CellN[t + 1] = Math.max(0, ((S['InitialFOMN_kg/ha'])-(S['InitialFOMN_kg/ha']*S.FOMpctLign/100))-S.CarbN[t]);
    S.SOCpct = 1.95;
    S.BD = 1.7;
    S.Depth_in = 8;
    S.Depth_layer_cm = S.Depth_in*2.54;
    S.Hum[t] = S.Hum[t + 1] = Math.max(0, S.SOCpct*S.BD*S.Depth_layer_cm*1000/0.58);
    S.HumN[t] = S.HumN[t + 1] = Math.max(0, S.SOCpct*S.Depth_layer_cm*S.BD*100);
    S.INppm = INppm;
    S.FAC = S.BD*S.Depth_layer_cm*0.1;
    S.INkg[t] = S.INkg[t + 1] = Math.max(0, S.INppm*S.FAC);
    S.Lign[t] = S.Lign[t + 1] = Math.max(0, S.FOM[t]*S.FOMpctLign/100);
    S.LigninN[t] = S.LigninN[t + 1] = Math.max(0, S['InitialFOMN_kg/ha']*S.FOMpctLign/100);
    S.LitterWaterContent[t] = S.LitterWaterContent[t + 1] = LitterWaterContent;
    S.MinNfromFOM[t] = S.MinNfromFOM[t + 1] = Math.max(0, 0);
    S.MinNfromHum[t] = S.MinNfromHum[t + 1] = Math.max(0, 0);
    S.NImmobFromFOM[t] = S.NImmobFromFOM[t + 1] = Math.max(0, 0);
    S.NimmobIntoCarbN[t] = S.NimmobIntoCarbN[t + 1] = Math.max(0, 0);
    S.Dew[t] = S.Dew[t + 1] = ( (S.RH[t]>85) && (PREVIOUS('RH',  0)<85) ?  (S.Rain[t]===0) ? 1 : 0 : 0);
    S.PrevLitWC[t] = S.PrevLitWC[t + 1] = DELAY('LitterWaterContent',  1);
    S.PrevRH[t] = S.PrevRH[t + 1] = DELAY('RH',  1);
    S.RHChange[t] = S.RHChange[t + 1] = S.RH[t]-S.PrevRH[t];
    S.c = 0.01;
    S.k_4[t] = S.k_4[t + 1] = S.c*S.Temp[t]*S.LitterWaterContent[t];
    S.WaterLossFromEvap[t] = S.WaterLossFromEvap[t + 1] = (S.LitterWaterContent[t] <= 0.04) ? 0 :  (S.Dew[t] === 0) && (PREVIOUS('Dew',  0) > 0) ? 0.4 :  (S.Rain[t] === 0) && (PREVIOUS('Rain',  0) > 0) ? 0.7 :  (S.RHChange[t] >= 0) ? 0 :  (S.RHChange[t] > -2.5) ? 0.001 :  (S.k_4[t] > 0.03) ? 0.06 : S.k_4[t];
    S.RainToGetCurrentWC[t] = S.RainToGetCurrentWC[t + 1] = (S.Rain[t]>0) ? -1.3191+0.829*EXP(0.7603*S.LitterWaterContent[t])+0.468*EXP(0.7603*S.LitterWaterContent[t]) : 0;
    S.WCFromRain[t] = S.WCFromRain[t + 1] = (S.Rain[t]>0) ? 1.6414*(1-EXP(-0.4351*(S.Rain[t]+S.RainToGetCurrentWC[t])))+4.3623*(1-EXP(-0.0324*(S.Rain[t]+S.RainToGetCurrentWC[t]))) : 0;
    S.FromRain[t] = S.FromRain[t + 1] = Math.max(0, (S.Rain[t]>0) ?  (S.WCFromRain[t]-S.LitterWaterContent[t])>0.3 ? 0.3 : (S.WCFromRain[t]-S.LitterWaterContent[t]) : 0);
    S.FromDew[t] = S.FromDew[t + 1] = Math.max(0, (S.Dew[t]===1) && (S.LitterWaterContent[t]<2.5) ?  (S.FOM[t]>1500) ? 0.85 : 0 : 0);
    S.Air_MPa[t] = S.Air_MPa[t + 1] = (8.314*(S.Temp[t]+273.15)*LN(S.RH[t]/100)/(18*10**-6))/1000000;
    S['%_lignin'][t] = S['%_lignin'][t + 1] = MIN(13, (S.Lign[t] / S.FOM[t]) * 100);
    S.a[t] = S.a[t + 1] = -0.5981*S['%_lignin'][t]+8.1823;
    S.b[t] = S.b[t + 1] = -0.1181*S['%_lignin'][t]-0.3783;
    S.LitterMPa[t] = S.LitterMPa[t + 1] = MAX(-200, -S.a[t] * (S.LitterWaterContent[t] ** S.b[t]));
    S.Litter_MPa_Gradient[t] = S.Litter_MPa_Gradient[t + 1] = (S.Air_MPa[t]-S.LitterMPa[t]);
    S.k1[t] = S.k1[t + 1] = (S.RHChange[t]===0) ? 0 :  (S.RHChange[t]>0) && (S.Litter_MPa_Gradient[t]<30) ? 0.0008 :  (S.RHChange[t]>0) && (S.Litter_MPa_Gradient[t]>30) ? 0.0004 : 0;
    S.FromAir[t] = S.FromAir[t + 1] = ((S.RHChange[t]>0) && (S.Litter_MPa_Gradient[t]>0)) ?  (S.k1[t]*S.Litter_MPa_Gradient[t]>0.01) ? 0.026 : (S.k1[t]*S.Litter_MPa_Gradient[t]) : 0;
    S.Evaporation[t] = S.Evaporation[t + 1] = Math.max(0, (S.LitterWaterContent[t]-S.WaterLossFromEvap[t]) >0 ? S.WaterLossFromEvap[t] : 0);
    S.CarbK[t] = S.CarbK[t + 1] = 0.018* EXP(-12*(S['%_lignin'][t]/100));
    S.RMTFAC[t] = S.RMTFAC[t + 1] = S.Temp[t] < 0 ? 0 : (0.384+0.018*S.Temp[t])*EXP(S.LitterMPa[t]*(0.142+0.628*S.Temp[t]**-1));
    S.FON[t] = S.FON[t + 1] = S.CarbN[t]+S.CellN[t]+S.LigninN[t];
    S.CNR[t] = S.CNR[t + 1] = (0.426*S.FOM[t])/(S.FON[t]+S.INkg[t]);
    S.CNRF[t] = S.CNRF[t + 1] = MIN(1, EXP(-0.693 * (S.CNR[t] - 13) / 13));
    S.Critical_FOM = 1400;
    S.ContactFactor[t] = S.ContactFactor[t + 1] = (S.FOM[t]>3000) ? (S.Critical_FOM/3000) : MIN(1, S.Critical_FOM/S.FOM[t]);
    S.DeCarb[t] = S.DeCarb[t + 1] = S.CarbK[t]*S.RMTFAC[t]*S.CNRF[t]*S.ContactFactor[t];
    S.GrNom1[t] = S.GrNom1[t + 1] = Math.max(0, S.CarbN[t]*S.DeCarb[t]);
    S.k3 = 0.01;
    S.CellK[t] = S.CellK[t + 1] = S.k3* EXP(-12*(S['%_lignin'][t]/100));
    S.DeCell[t] = S.DeCell[t + 1] = S.CellK[t]*S.RMTFAC[t]*S.CNRF[t]*S.ContactFactor[t];
    S.GRNom2[t] = S.GRNom2[t + 1] = Math.max(0, S.CellN[t]*S.DeCell[t]);
    S.LignK = 0.00095;
    S.DeLign[t] = S.DeLign[t + 1] = S.LignK*S.RMTFAC[t]*S.CNRF[t]*S.ContactFactor[t];
    S.GRNOm3[t] = S.GRNOm3[t + 1] = Math.max(0, S.LigninN[t]*S.DeLign[t]);
    S.GRNom[t] = S.GRNom[t + 1] = S.GrNom1[t]+S.GRNom2[t]+S.GRNOm3[t];
    S.FractionHumified = 0.125;
    S.FOMNhum[t] = S.FOMNhum[t + 1] = Math.max(0, S.GRNom[t]*S.FractionHumified);
    S.GRCom1[t] = S.GRCom1[t + 1] = Math.max(0, S.Carb[t]*S.DeCarb[t]);
    S.GRCom2[t] = S.GRCom2[t + 1] = Math.max(0, S.Cell[t]*S.DeCell[t]);
    S.GRCom3[t] = S.GRCom3[t + 1] = Math.max(0, S.Lign[t]*S.DeLign[t]);
    S.GRCom[t] = S.GRCom[t + 1] = Math.max(0, S.GRCom1[t]+S.GRCom2[t]+S.GRCom3[t]);
    S.Resistant[t] = S.Resistant[t + 1] = Math.max(0, S.FractionHumified * S.GRNom[t] / 0.04);
    S.PMNhotKCl = 10;
    S.Dminr = ((((0.0024+0.022*S.PMNhotKCl)*(S.BD*S.Depth_layer_cm)/10)/0.66666)/0.70)*2/24;
    S.HumMin[t] = S.HumMin[t + 1] = Math.max(0, (S.Dminr*S.RMTFAC[t])/0.04);
    S.RhMin[t] = S.RhMin[t + 1] = Math.max(0, S.Dminr*S.RMTFAC[t]);
    S.NetMin[t] = S.NetMin[t + 1] = Math.max(0, S.RhMin[t]+(1-S.FractionHumified)*S.GRNom[t]);
    S.RNAC[t] = S.RNAC[t + 1] = Math.max(0, MIN(S.INkg[t], S.GRCom[t] * 0.0213 - S.GRNom[t]));
    S.MinFromFOMRate[t] = S.MinFromFOMRate[t + 1] = Math.max(0, S.GRNom[t]*(1-S.FractionHumified)-S.RNAC[t]);
    S.MinFromHumRate[t] = S.MinFromHumRate[t + 1] = Math.max(0, S.RhMin[t]);
    S.Noname_1[t] = S.Noname_1[t + 1] = Math.max(0, S.FOMNhum[t]);
    S.Noname_2[t] = S.Noname_2[t + 1] = Math.max(0, S.RNAC[t]);
    S['overall_%N'][t] = S['overall_%N'][t + 1] = (S.FON[t]/S.FOM[t])*100;
    S.Sat = (1-(S.BD/2.65))/S.BD;
    
    for (t = 1; t <= hours; t++) {
      S.FOM[t] = S.FOM[t + 1] = Math.max(0, S.FOM[t - dt] + ( - S.GRCom[t]) * dt);
      S.Carb[t] = S.Carb[t + 1] = Math.max(0, S.Carb[t - dt] + ( - S.GRCom1[t]) * dt);
      S.CarbN[t] = S.CarbN[t + 1] = Math.max(0, S.CarbN[t - dt] + (S.RNAC[t] - S.GrNom1[t]) * dt);
      S.Cell[t] = S.Cell[t + 1] = Math.max(0, S.Cell[t - dt] + ( - S.GRCom2[t]) * dt);
      S.CellN[t] = S.CellN[t + 1] = Math.max(0, S.CellN[t - dt] + ( - S.GRNom2[t]) * dt);
      S.Hum[t] = S.Hum[t + 1] = Math.max(0, S.Hum[t - dt] + (S.Resistant[t] - S.HumMin[t]) * dt);
      S.HumN[t] = S.HumN[t + 1] = Math.max(0, S.HumN[t - dt] + (S.FOMNhum[t] - S.RhMin[t]) * dt);
      S.INkg[t] = S.INkg[t + 1] = Math.max(0, S.INkg[t - dt] + (S.NetMin[t] - S.RNAC[t]) * dt);
      S.Lign[t] = S.Lign[t + 1] = Math.max(0, S.Lign[t - dt] + ( - S.GRCom3[t]) * dt);
      S.LigninN[t] = S.LigninN[t + 1] = Math.max(0, S.LigninN[t - dt] + ( - S.GRNOm3[t]) * dt);
      S.LitterWaterContent[t] = S.LitterWaterContent[t + 1] = Math.max(0, S.LitterWaterContent[t - dt] + (S.FromAir[t] + S.FromRain[t] + S.FromDew[t] - S.Evaporation[t]) * dt);
      S.MinNfromFOM[t] = S.MinNfromFOM[t + 1] = Math.max(0, S.MinNfromFOM[t - dt] + (S.MinFromFOMRate[t]) * dt);
      S.MinNfromHum[t] = S.MinNfromHum[t + 1] = Math.max(0, S.MinNfromHum[t - dt] + (S.MinFromHumRate[t]) * dt);
      S.NImmobFromFOM[t] = S.NImmobFromFOM[t + 1] = Math.max(0, S.NImmobFromFOM[t - dt] + (S.Noname_1[t]) * dt);
      S.NimmobIntoCarbN[t] = S.NimmobIntoCarbN[t + 1] = Math.max(0, S.NimmobIntoCarbN[t - dt] + (S.Noname_2[t]) * dt);
      S['InitialFOMN_kg/ha'] = S['FOMkg/ha']*S.FOMpctN/100;
      S.Depth_in = 8;
      S.Depth_layer_cm = S.Depth_in*2.54;
      S.BD = 1.7;
      S.FAC = S.BD*S.Depth_layer_cm*0.1;
      S.Dew[t] = S.Dew[t + 1] = ( (S.RH[t]>85) && (PREVIOUS('RH',  0)<85) ?  (S.Rain[t]===0) ? 1 : 0 : 0);
      S.PrevLitWC[t] = S.PrevLitWC[t + 1] = DELAY('LitterWaterContent',  1);
      S.PrevRH[t] = S.PrevRH[t + 1] = DELAY('RH',  1);
      S.RHChange[t] = S.RHChange[t + 1] = S.RH[t]-S.PrevRH[t];
      S.k_4[t] = S.k_4[t + 1] = S.c*S.Temp[t]*S.LitterWaterContent[t];
      S.WaterLossFromEvap[t] = S.WaterLossFromEvap[t + 1] = (S.LitterWaterContent[t] <= 0.04) ? 0 :  (S.Dew[t] === 0) && (PREVIOUS('Dew',  0) > 0) ? 0.4 :  (S.Rain[t] === 0) && (PREVIOUS('Rain',  0) > 0) ? 0.7 :  (S.RHChange[t] >= 0) ? 0 :  (S.RHChange[t] > -2.5) ? 0.001 :  (S.k_4[t] > 0.03) ? 0.06 : S.k_4[t];
      S.RainToGetCurrentWC[t] = S.RainToGetCurrentWC[t + 1] = (S.Rain[t]>0) ? -1.3191+0.829*EXP(0.7603*S.LitterWaterContent[t])+0.468*EXP(0.7603*S.LitterWaterContent[t]) : 0;
      S.WCFromRain[t] = S.WCFromRain[t + 1] = (S.Rain[t]>0) ? 1.6414*(1-EXP(-0.4351*(S.Rain[t]+S.RainToGetCurrentWC[t])))+4.3623*(1-EXP(-0.0324*(S.Rain[t]+S.RainToGetCurrentWC[t]))) : 0;
      S.FromRain[t] = S.FromRain[t + 1] = Math.max(0, (S.Rain[t]>0) ?  (S.WCFromRain[t]-S.LitterWaterContent[t])>0.3 ? 0.3 : (S.WCFromRain[t]-S.LitterWaterContent[t]) : 0);
      S.FromDew[t] = S.FromDew[t + 1] = Math.max(0, (S.Dew[t]===1) && (S.LitterWaterContent[t]<2.5) ?  (S.FOM[t]>1500) ? 0.85 : 0 : 0);
      S.Air_MPa[t] = S.Air_MPa[t + 1] = (8.314*(S.Temp[t]+273.15)*LN(S.RH[t]/100)/(18*10**-6))/1000000;
      S['%_lignin'][t] = S['%_lignin'][t + 1] = MIN(13, (S.Lign[t] / S.FOM[t]) * 100);
      S.a[t] = S.a[t + 1] = -0.5981*S['%_lignin'][t]+8.1823;
      S.b[t] = S.b[t + 1] = -0.1181*S['%_lignin'][t]-0.3783;
      S.LitterMPa[t] = S.LitterMPa[t + 1] = MAX(-200, -S.a[t] * (S.LitterWaterContent[t] ** S.b[t]));
      S.Litter_MPa_Gradient[t] = S.Litter_MPa_Gradient[t + 1] = (S.Air_MPa[t]-S.LitterMPa[t]);
      S.k1[t] = S.k1[t + 1] = (S.RHChange[t]===0) ? 0 :  (S.RHChange[t]>0) && (S.Litter_MPa_Gradient[t]<30) ? 0.0008 :  (S.RHChange[t]>0) && (S.Litter_MPa_Gradient[t]>30) ? 0.0004 : 0;
      S.FromAir[t] = S.FromAir[t + 1] = ((S.RHChange[t]>0) && (S.Litter_MPa_Gradient[t]>0)) ?  (S.k1[t]*S.Litter_MPa_Gradient[t]>0.01) ? 0.026 : (S.k1[t]*S.Litter_MPa_Gradient[t]) : 0;
      S.Evaporation[t] = S.Evaporation[t + 1] = Math.max(0, (S.LitterWaterContent[t]-S.WaterLossFromEvap[t]) >0 ? S.WaterLossFromEvap[t] : 0);
      S.RMTFAC[t] = S.RMTFAC[t + 1] = S.Temp[t] < 0 ? 0 : (0.384+0.018*S.Temp[t])*EXP(S.LitterMPa[t]*(0.142+0.628*S.Temp[t]**-1));
      S.FON[t] = S.FON[t + 1] = S.CarbN[t]+S.CellN[t]+S.LigninN[t];
      S.CNR[t] = S.CNR[t + 1] = (0.426*S.FOM[t])/(S.FON[t]+S.INkg[t]);
      S.CNRF[t] = S.CNRF[t + 1] = MIN(1, EXP(-0.693 * (S.CNR[t] - 13) / 13));
      S.Critical_FOM = 1400;
      S.ContactFactor[t] = S.ContactFactor[t + 1] = (S.FOM[t]>3000) ? (S.Critical_FOM/3000) : MIN(1, S.Critical_FOM/S.FOM[t]);
      S.CarbK[t] = S.CarbK[t + 1] = 0.018* EXP(-12*(S['%_lignin'][t]/100));
      S.DeCarb[t] = S.DeCarb[t + 1] = S.CarbK[t]*S.RMTFAC[t]*S.CNRF[t]*S.ContactFactor[t];
      S.GrNom1[t] = S.GrNom1[t + 1] = Math.max(0, S.CarbN[t]*S.DeCarb[t]);
      S.k3 = 0.01;
      S.CellK[t] = S.CellK[t + 1] = S.k3* EXP(-12*(S['%_lignin'][t]/100));
      S.DeCell[t] = S.DeCell[t + 1] = S.CellK[t]*S.RMTFAC[t]*S.CNRF[t]*S.ContactFactor[t];
      S.GRNom2[t] = S.GRNom2[t + 1] = Math.max(0, S.CellN[t]*S.DeCell[t]);
      S.LignK = 0.00095;
      S.DeLign[t] = S.DeLign[t + 1] = S.LignK*S.RMTFAC[t]*S.CNRF[t]*S.ContactFactor[t];
      S.GRNOm3[t] = S.GRNOm3[t + 1] = Math.max(0, S.LigninN[t]*S.DeLign[t]);
      S.GRNom[t] = S.GRNom[t + 1] = S.GrNom1[t]+S.GRNom2[t]+S.GRNOm3[t];
      S.FractionHumified = 0.125;
      S.FOMNhum[t] = S.FOMNhum[t + 1] = Math.max(0, S.GRNom[t]*S.FractionHumified);
      S.GRCom1[t] = S.GRCom1[t + 1] = Math.max(0, S.Carb[t]*S.DeCarb[t]);
      S.GRCom2[t] = S.GRCom2[t + 1] = Math.max(0, S.Cell[t]*S.DeCell[t]);
      S.GRCom3[t] = S.GRCom3[t + 1] = Math.max(0, S.Lign[t]*S.DeLign[t]);
      S.GRCom[t] = S.GRCom[t + 1] = Math.max(0, S.GRCom1[t]+S.GRCom2[t]+S.GRCom3[t]);
      S.Resistant[t] = S.Resistant[t + 1] = Math.max(0, S.FractionHumified * S.GRNom[t] / 0.04);
      S.Dminr = ((((0.0024+0.022*S.PMNhotKCl)*(S.BD*S.Depth_layer_cm)/10)/0.66666)/0.70)*2/24;
      S.HumMin[t] = S.HumMin[t + 1] = Math.max(0, (S.Dminr*S.RMTFAC[t])/0.04);
      S.RhMin[t] = S.RhMin[t + 1] = Math.max(0, S.Dminr*S.RMTFAC[t]);
      S.NetMin[t] = S.NetMin[t + 1] = Math.max(0, S.RhMin[t]+(1-S.FractionHumified)*S.GRNom[t]);
      S.RNAC[t] = S.RNAC[t + 1] = Math.max(0, MIN(S.INkg[t], S.GRCom[t] * 0.0213 - S.GRNom[t]));
      S.MinFromFOMRate[t] = S.MinFromFOMRate[t + 1] = Math.max(0, S.GRNom[t]*(1-S.FractionHumified)-S.RNAC[t]);
      S.MinFromHumRate[t] = S.MinFromHumRate[t + 1] = Math.max(0, S.RhMin[t]);
      S.Noname_1[t] = S.Noname_1[t + 1] = Math.max(0, S.FOMNhum[t]);
      S.Noname_2[t] = S.Noname_2[t + 1] = Math.max(0, S.RNAC[t]);
      S['overall_%N'][t] = S['overall_%N'][t + 1] = (S.FON[t]/S.FOM[t])*100;
      S.Sat = (1-(S.BD/2.65))/S.BD;
    }
    
    Object.keys(S).forEach(p => {
      if (S[p].length) {
        S[p] = S[p].slice(0, stop + 1);
      }
    });
  }
  return S;
} // transpile

export default transpile;