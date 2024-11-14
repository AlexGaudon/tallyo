import { db } from "@/server/db";
import { category, transaction as tranTable } from "@/server/db/schema";

const userId = "kuM1Hx-yu3AipDK3hEi3U";

async function readFile(file: string) {
  return JSON.parse(await Bun.file(file).text());
}
const categories = await readFile("./category.json");
const transactions = await readFile("./transaction.json");

const getCategoryName = (id: string) => {
  return categories.find((x: any) => x.id === id).name || null;
};

console.log(categories);
console.log(transactions);

const newCategories = await db.select().from(category);

for (let transaction of transactions) {
  const catName = getCategoryName(transaction.category_id);
  transaction.categoryId = newCategories.find((x) => x.name === catName)?.id;
  transaction.date = new Date(transaction.date);
  transaction.createdAt = new Date(transaction.created_at);
  transaction.updatedAt = new Date(transaction.updated_at);
  transaction.userId = userId;
  transaction.externalId = transaction.external_id;
}

await Bun.write(
  "./transactions-modified.json",
  JSON.stringify(transactions, null, 2),
);
const res = await db.insert(tranTable).values(transactions).execute();
console.log(res);
