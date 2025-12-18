


const BASE_URL = 'http://localhost:4000/api';

async function main() {
    console.log('--- Starting Verification ---');

    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'shyam_27', password: 'shyam271106' })
    });

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        process.exit(1);
    }

    const loginData = await loginRes.json();
    console.log('Login successful. User:', loginData.user.username);
    const userId = loginData.user.id;

    // 2. Create Prompt
    console.log('Creating Prompt...');
    const promptRes = await fetch(`${BASE_URL}/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'API Verification Prompt',
            content: 'This prompt verifies the API fix for tags array.',
            model: 'Gemini 1.5 Pro',
            tags: ['API', 'Verification'], // Sending as array to test current fix
            authorId: userId
        })
    });

    if (!promptRes.ok) {
        console.error('Create Prompt failed:', await promptRes.text());
        process.exit(1);
    }

    const promptData = await promptRes.json();
    console.log('Prompt created:', promptData.prompt.id);
    console.log('Prompt tags type:', Array.isArray(promptData.prompt.tags) ? 'Array' : typeof promptData.prompt.tags);
    console.log('Prompt author type:', typeof promptData.prompt.author);

    // 2b. Get Prompts
    const getPromptsRes = await fetch(`${BASE_URL}/prompts`);
    const prompts = await getPromptsRes.json();
    console.log('Fetched Prompts:', prompts.length);
    if (prompts.length > 0) {
        console.log('First prompt tags type:', Array.isArray(prompts[0].tags) ? 'Array' : typeof prompts[0].tags);
        console.log('First prompt author type:', typeof prompts[0].author);
    }

    // 3. Send Feedback
    console.log('Sending Feedback...');
    const fbRes = await fetch(`${BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from: 'shyam_27',
            message: 'This is a test feedback from API verification script.'
        })
    });

    if (!fbRes.ok) {
        console.error('Feedback failed:', await fbRes.text());
        process.exit(1);
    }
    console.log('Feedback sent successfully.');

    console.log('--- Verification Complete ---');
}

main().catch(console.error);
