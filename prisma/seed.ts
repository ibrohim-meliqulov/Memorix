import { PrismaClient, Plan } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed boshlandi...');

  const user = await prisma.user.upsert({
    where: { telegramId: '123456789' },
    update: {},
    create: {
      telegramId: '123456789',
      username: 'test_user',
      firstName: 'Test',
      subscription: {
        create: {
          plan: Plan.FREE,
        },
      },
    },
  });

  console.log(`✅ User yaratildi: ${user.firstName} (ID: ${user.id})`);

  const deck = await prisma.deck.create({
    data: {
      title: "Inglizcha — Boshlang'ich",
      description: "Eng ko'p ishlatiladigan 20 ta inglizcha so'z",
      userId: user.id,
    },
  });

  console.log(`✅ Deck yaratildi: ${deck.title}`);

  const words = [
    { front: 'Apple', back: 'Olma', example: 'I eat an apple every day.' },
    { front: 'Book', back: 'Kitob', example: 'She reads a book at night.' },
    { front: 'Water', back: 'Suv', example: 'Please give me some water.' },
    { front: 'House', back: 'Uy', example: 'My house is very big.' },
    { front: 'Friend', back: "Do'st", example: 'He is my best friend.' },
  ];

  for (const word of words) {
    await prisma.flashcard.create({
      data: {
        frontText: word.front,
        backText: word.back,
        example: word.example,
        deckId: deck.id,
      },
    });
  }

  console.log(`✅ ${words.length} ta flashcard yaratildi`);
  console.log('🎉 Seed muvaffaqiyatli tugadi!');
}

main()
  .catch((e) => {
    console.error('❌ Seed xatosi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
