
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000/api';

async function main() {
    console.log('--- Feedback API Verification ---');

    // 1. Create Feedback
    console.log('1. Creating Feedback...');
    const createRes = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'TestUser', message: 'Test Feedback' })
    });
    const createData = await createRes.json();
    console.log('Create Response:', createData);
    const feedbackId = createData.feedback?.id;

    if (!feedbackId) {
        console.error('Failed to create feedback');
        return;
    }

    // 2. Get Feedback
    console.log('\n2. Fetching Feedback...');
    const getRes = await fetch(`${API_BASE}/feedback`);
    const feedbackList = await getRes.json();
    console.log(`Fetched ${feedbackList.length} items`);
    const found = feedbackList.find(f => f.id === feedbackId);
    console.log('Found created feedback:', !!found);

    // 3. Mark Read
    console.log('\n3. Marking Read...');
    const markRes = await fetch(`${API_BASE}/feedback/${feedbackId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
    });
    const markData = await markRes.json();
    console.log('Mark Read Response:', markData);

    // 4. Delete
    console.log('\n4. Deleting...');
    const delRes = await fetch(`${API_BASE}/feedback/${feedbackId}`, { method: 'DELETE' });
    const delData = await delRes.json();
    console.log('Delete Response:', delData);

    // 5. Verify Delete
    console.log('\n5. Verifying Delete...');
    const getRes2 = await fetch(`${API_BASE}/feedback`);
    const feedbackList2 = await getRes2.json();
    const found2 = feedbackList2.find(f => f.id === feedbackId);
    console.log('Feedback still exists:', !!found2);
}

main().catch(console.error);
