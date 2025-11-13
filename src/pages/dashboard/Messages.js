import { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboardService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    dashboardService.getMessages()
      .then(setMessages)
      .catch(() => alert('Xabarlar yuklanmadi'))
      .finally(() => setLoading(false));
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const sent = await dashboardService.sendMessage({ content: newMessage, to: 'all' });
      setMessages(prev => [...prev, sent]);
      setNewMessage('');
    } catch (err) {
      alert('Xabar yuborilmadi');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Xabarlar</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Xabar yozing..."
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={sendMessage}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Yuborish
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`p-4 rounded-lg ${msg.isAdmin ? 'bg-blue-50 ml-8' : 'bg-gray-100 mr-8'}`}>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{msg.sender}</span>
              <span>{new Date(msg.sentAt).toLocaleTimeString()}</span>
            </div>
            <p className="text-sm">{msg.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}