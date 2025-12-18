export const contentToProxiedImageUrl = (url?: string): string => {
    if (!url) return '';

    // Check if it's a Google Drive URL
    if (url.includes('drive.google.com')) {
        // Try to extract the ID
        // Patterns:
        // /file/d/VIDEO_ID/view
        // /open?id=VIDEO_ID
        // /uc?id=VIDEO_ID

        let id = '';

        const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (fileDMatch) {
            id = fileDMatch[1];
        } else {
            const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (idMatch) {
                id = idMatch[1];
            }
        }

        if (id) {
            return `https://drive.google.com/uc?export=view&id=${id}`;
        }
    }

    return url;
};
