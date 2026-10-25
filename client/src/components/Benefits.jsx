import { benefitLines } from '../format.js';

export default function Benefits({ text }) {
  return (
    <ul className="benefits">
      {benefitLines(text).map((line, i) => <li key={i}>{line}</li>)}
    </ul>
  );
}
