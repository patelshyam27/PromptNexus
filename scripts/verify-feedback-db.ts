
import { prisma } from '../api/db';

async function main() {
    console.log('--- Feedback DB Verification ---');

    try {
        // 1. Create
        console.log('1. Creating Feedback...');
        const feedback = await prisma.feedback.create({
            data: { from: 'TestUser', message: 'Test Message' }
        });
        console.log('Created:', feedback.id);

        // 2. Read
        console.log('2. Reading Feedback...');
        const list = await prisma.feedback.findMany();
        const found = list.find(f => f.id === feedback.id);
        console.log('Found:', !!found);

        // 3. Update (Mark Read)
        console.log('3. Marking Read...');
        const updated = await prisma.feedback.update({
            where: { id: feedback.id },
            data: { read: true }
        });
        console.log('Read Status:', updated.read);

        // 4. Delete
        console.log('4. Deleting...');
        await prisma.feedback.delete({ where: { id: feedback.id } });
        console.log('Deleted.');

        // 5. Verify
        const verify = await prisma.feedback.findUnique({ where: { id: feedback.id } });
        console.log('Exists:', !!verify);

    } catch (e) {
        console.error('Verification Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
