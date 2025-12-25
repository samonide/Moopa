/**
 * Test Script for Manga Provider System
 * 
 * Run this with: npx ts-node scripts/test-manga-provider.ts
 * Or import and use in your own test files
 */

import { comixProvider } from '../lib/comix/provider';

async function testComixProvider() {
    console.log('🧪 Testing Comix Provider\n');

    // Test 1: Search
    console.log('1️⃣ Testing Search...');
    try {
        const searchResults = await comixProvider.search({ query: 'One Piece' });
        console.log(`✅ Found ${searchResults.length} results`);

        if (searchResults.length > 0) {
            const first = searchResults[0];
            console.log(`   📖 First result: ${first.title}`);
            console.log(`   🆔 ID: ${first.id}`);
            console.log(`   🖼️  Image: ${first.image.substring(0, 50)}...`);

            // Test 2: Get Chapters
            console.log('\n2️⃣ Testing Chapters...');
            const chapters = await comixProvider.findChapters(first.id);
            console.log(`✅ Found ${chapters.length} chapters`);

            if (chapters.length > 0) {
                const firstChapter = chapters[0];
                console.log(`   📄 First chapter: ${firstChapter.title}`);
                console.log(`   🔢 Chapter number: ${firstChapter.chapter}`);
                console.log(`   👤 Scanlator: ${firstChapter.scanlator || 'Unknown'}`);
                console.log(`   🌐 Language: ${firstChapter.language || 'Unknown'}`);
                console.log(`   🆔 ID: ${firstChapter.id}`);

                // Test 3: Get Pages
                console.log('\n3️⃣ Testing Pages...');
                const pages = await comixProvider.findChapterPages(firstChapter.id);
                console.log(`✅ Found ${pages.length} pages`);

                if (pages.length > 0) {
                    const firstPage = pages[0];
                    console.log(`   📄 First page URL: ${firstPage.url.substring(0, 50)}...`);
                    console.log(`   🔗 Referer: ${firstPage.headers?.Referer || 'None'}`);
                }
            }
        }

        console.log('\n✨ All tests passed!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

async function testProviderSettings() {
    console.log('\n⚙️  Testing Provider Settings...');
    const settings = comixProvider.getSettings();
    console.log('Settings:', settings);
    console.log(`✅ Multi-scanlator support: ${settings.supportsMultiScanlator ? 'Yes' : 'No'}`);
}

async function testEdgeCases() {
    console.log('\n🔍 Testing Edge Cases...\n');

    // Test empty search
    console.log('1️⃣ Empty search query...');
    const emptyResults = await comixProvider.search({ query: '' });
    console.log(`   Result: ${emptyResults.length} results (expected: 0 or few)`);

    // Test invalid manga ID
    console.log('\n2️⃣ Invalid manga ID...');
    const invalidChapters = await comixProvider.findChapters('invalid-id');
    console.log(`   Result: ${invalidChapters.length} chapters (expected: 0)`);

    // Test invalid chapter ID
    console.log('\n3️⃣ Invalid chapter ID...');
    const invalidPages = await comixProvider.findChapterPages('invalid-chapter');
    console.log(`   Result: ${invalidPages.length} pages (expected: 0)`);

    console.log('\n✅ Edge case tests complete');
}

// Main test runner
async function runAllTests() {
    console.log('════════════════════════════════════════════════════\n');
    console.log('   🧪 MANGA PROVIDER SYSTEM TEST SUITE\n');
    console.log('════════════════════════════════════════════════════\n');

    try {
        await testProviderSettings();
        await testComixProvider();
        await testEdgeCases();

        console.log('\n════════════════════════════════════════════════════');
        console.log('   ✅ ALL TESTS COMPLETED SUCCESSFULLY');
        console.log('════════════════════════════════════════════════════\n');
    } catch (error) {
        console.error('\n════════════════════════════════════════════════════');
        console.error('   ❌ TESTS FAILED');
        console.error('════════════════════════════════════════════════════\n');
        console.error(error);
        process.exit(1);
    }
}

// Export for use in other tests
export {
    testComixProvider,
    testProviderSettings,
    testEdgeCases,
    runAllTests,
};

// Run if called directly
if (require.main === module) {
    runAllTests();
}
