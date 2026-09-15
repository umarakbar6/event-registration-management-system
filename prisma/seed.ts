import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.feedback.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const attendeePassword = await bcrypt.hash("Attendee123!", 12);

  const admin = await prisma.user.create({
    data: { name: "System Administrator", email: "admin@example.com", passwordHash: adminPassword, role: "ADMIN" },
  });
  const alex = await prisma.user.create({
    data: { name: "Alex Morgan", email: "alex@example.com", passwordHash: attendeePassword, role: "ATTENDEE" },
  });
  const maya = await prisma.user.create({
    data: { name: "Maya Patel", email: "maya@example.com", passwordHash: attendeePassword, role: "ATTENDEE" },
  });
  const jordan = await prisma.user.create({
    data: { name: "Jordan Lee", email: "jordan@example.com", passwordHash: attendeePassword, role: "ATTENDEE" },
  });

  const now = new Date();
  const daysFromNow = (days: number, hour: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + days);
    date.setHours(hour, 0, 0, 0);
    return date;
  };

  const forum = await prisma.event.create({
    data: {
      title: "Product Makers Forum",
      description: "A focused gathering for people who build thoughtful digital products. Meet peers, learn from operators, and leave with practical ideas you can use next week.",
      location: "Harbor Hall, Nowshera",
      startDateTime: daysFromNow(30, 10),
      endDateTime: daysFromNow(30, 16),
      capacity: 120,
      seatsTaken: 2,
      status: "PUBLISHED",
      category: "Community",
      imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=85",
      createdById: admin.id,
    },
  });
  const breakfast = await prisma.event.create({
    data: {
      title: "AI Builders Breakfast",
      description: "An early morning conversation about useful AI, reliable workflows, and building products that help people do better work.",
      location: "The Foundry, Nowshera",
      startDateTime: daysFromNow(14, 9),
      endDateTime: daysFromNow(14, 12),
      capacity: 8,
      seatsTaken: 7,
      status: "PUBLISHED",
      category: "Technology",
      imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=85",
      createdById: admin.id,
    },
  });
  const fullEvent = await prisma.event.create({
    data: {
      title: "Frontend Performance Clinic",
      description: "A practical clinic for teams who want faster, more resilient product experiences.",
      location: "The Foundry, Nowshera",
      startDateTime: daysFromNow(21, 14),
      endDateTime: daysFromNow(21, 17),
      capacity: 3,
      seatsTaken: 3,
      status: "PUBLISHED",
      category: "Technology",
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=85",
      createdById: admin.id,
    },
  });
  await prisma.event.create({
    data: {
      title: "Designing for Trust",
      description: "A practical workshop on clear interfaces, transparent systems, and experiences that earn confidence.",
      location: "Studio 12, Nowshera",
      startDateTime: daysFromNow(45, 11),
      endDateTime: daysFromNow(45, 15),
      capacity: 45,
      status: "DRAFT",
      category: "Design",
      imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85",
      createdById: admin.id,
    },
  });
  await prisma.event.create({
    data: {
      title: "Community Demo Night",
      description: "A relaxed evening of short product demos from local makers and founders.",
      location: "Civic Lab, Nowshera",
      startDateTime: daysFromNow(7, 18),
      endDateTime: daysFromNow(7, 21),
      capacity: 80,
      status: "CANCELLED",
      category: "Community",
      imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85",
      createdById: admin.id,
    },
  });
  const summit = await prisma.event.create({
    data: {
      title: "Responsible Technology Summit",
      description: "A completed day of talks and workshops about building technology with care.",
      location: "Innovation Center, Nowshera",
      startDateTime: daysFromNow(-30, 10),
      endDateTime: daysFromNow(-30, 17),
      capacity: 100,
      seatsTaken: 2,
      status: "COMPLETED",
      category: "Technology",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85",
      createdById: admin.id,
    },
  });
  await prisma.event.create({
    data: {
      title: "Historical Registration Fixture",
      description: "A published event retained to verify that past dates cannot accept registrations.",
      location: "Archive Hall, Nowshera",
      startDateTime: daysFromNow(-2, 10),
      endDateTime: daysFromNow(-2, 12),
      capacity: 20,
      status: "PUBLISHED",
      category: "Testing",
      imageUrl: null,
      createdById: admin.id,
    },
  });

  await prisma.registration.createMany({
    data: [
      { userId: alex.id, eventId: forum.id, status: "ACTIVE" },
      { userId: maya.id, eventId: forum.id, status: "ACTIVE" },
      { userId: alex.id, eventId: breakfast.id, status: "ACTIVE" },
      { userId: maya.id, eventId: breakfast.id, status: "ACTIVE" },
      { userId: jordan.id, eventId: breakfast.id, status: "ACTIVE" },
      { userId: alex.id, eventId: fullEvent.id, status: "ACTIVE" },
      { userId: maya.id, eventId: fullEvent.id, status: "ACTIVE" },
      { userId: jordan.id, eventId: fullEvent.id, status: "ACTIVE" },
      { userId: alex.id, eventId: summit.id, status: "ATTENDED" },
      { userId: maya.id, eventId: summit.id, status: "ATTENDED" },
    ],
  });
  await prisma.feedback.create({
    data: { userId: alex.id, eventId: summit.id, rating: 5, comment: "A thoughtful and well run event. The practical sessions were excellent." },
  });

  console.log("Demo data is ready.");
  console.log("Admin: admin@example.com / Admin123!");
  console.log("Attendee: alex@example.com / Attendee123!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
