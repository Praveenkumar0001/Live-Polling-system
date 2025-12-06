import { UI_MESSAGES } from '../../utils/constants';
import '../../styles/ParticipantsPanel.css';

const ParticipantsPanel = ({ participants, isTeacher, onKickParticipant }) => {
  const students = participants.filter(p => p.role === 'student');

  if (students.length === 0) {
    return (
      <div className="no-participants">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4C13.5 4 5 12.5 5 23C5 33.5 13.5 42 24 42C34.5 42 43 33.5 43 23C43 12.5 34.5 4 24 4Z" stroke="#9CA3AF" strokeWidth="3"/>
          <path d="M24 14C19.6 14 16 17.6 16 22C16 26.4 19.6 30 24 30C28.4 30 32 26.4 32 22C32 17.6 28.4 14 24 14Z" stroke="#9CA3AF" strokeWidth="3"/>
          <path d="M10 38C12 32 17.5 28 24 28C30.5 28 36 32 38 38" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <p>{UI_MESSAGES.NO_PARTICIPANTS}</p>
      </div>
    );
  }

  return (
    <div className="participants-list">
      <table className="participants-table">
        <thead>
          <tr>
            <th>Name</th>
            {isTeacher && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {students.map((participant) => (
            <tr key={participant.id}>
              <td>
                <div className="participant-info">
                  <div className="participant-avatar">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="participant-name">{participant.name}</span>
                </div>
              </td>
              {isTeacher && (
                <td>
                  <button
                    className="kick-btn btn-danger"
                    onClick={() => onKickParticipant(participant.id)}
                  >
                    Kick out
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ParticipantsPanel;