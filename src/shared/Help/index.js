import {useSelector} from 'react-redux';

import {get} from '../../store/Store';
import './styles.scss';

export const Help = () => {
  const help  = useSelector(get.help);
  const helpX = useSelector(get.helpX);
  const helpY = useSelector(get.helpY);

  const style = {
    left: helpX,
    top: helpY,
    maxWidth:  `calc(100vw - ${helpX}px - 20px)`,
    maxHeight: `calc(100vh - ${helpY}px - 20px)`,
    overflow: 'auto'
  }

  return (
    help &&
    <div
      className="help"
      style={style}
      dangerouslySetInnerHTML={{ __html: help }}
    />
  )
} // Help
