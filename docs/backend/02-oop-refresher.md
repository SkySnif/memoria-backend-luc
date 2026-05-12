# 💎 OOP Refresher

> Quick refresher on Object-Oriented Programming for students. If classes, instances, and interfaces feel rusty, read this once before diving into the codebase.

## The big idea

Imagine you're building a city.

- **Without OOP**: a giant list of instructions in no particular order — "paint a wall blue", "install a door", "paint another wall red". You lose track fast.
- **With OOP**: you design a `House` blueprint that says "a house has a color and a door", then you say "make 3 houses from this blueprint".

That's exactly how we model **Users**, **Items**, and **Tags** in this project.

## Class vs Instance — the mold and the cake

This is the most important distinction. A **class** is the recipe (code). An **instance** is the real cake (data in memory).

```text
        [ CLASS ]                       [ INSTANCE ]
       (The mold)                     (The actual cake)
   +-------------------+           +-----------------------+
   |   class Item      |           |   Item: "L'Étranger"  |
   |-------------------|           |-----------------------|
   | - id              |           | - id: "abc-123"       |
   | - title           |  (new)    | - title: "L'Étranger" |
   | - contentType     | --------> +-----------------------+
   |                   |
   | + updateTitle()   |           +-----------------------+
   +-------------------+           |   Item: "Sapiens"     |
                                   |-----------------------|
                                   | - id: "def-456"       |
                                   | - title: "Sapiens"    |
                                   +-----------------------+
```

In TypeScript:

```ts
// The class — written once
class Item {
  constructor(
    public readonly id: string,
    public title: string,
    public readonly contentType: ContentType
  ) {}

  updateTitle(newTitle: string): void {
    this.title = newTitle;
  }
}

// The instances — created as many times as needed
const book1 = new Item('abc-123', "L'Étranger", 'book');
const book2 = new Item('def-456', 'Sapiens', 'book');

book1.updateTitle('The Stranger'); // affects only book1
```

The `new` keyword is what turns the blueprint into a real, usable object in memory.

## Instance methods vs static methods

In an instance method, `this` refers to **the specific cake** you're talking to:

```ts
class Item {
  constructor(public title: string) {}

  // Instance method: needs an instance to be called
  greet(): string {
    return `Hi, I'm ${this.title}`;
  }
}

const book = new Item('Sapiens');
book.greet(); // → "Hi, I'm Sapiens"
```

A `static` method belongs to the **class itself**, not to any instance:

```ts
class LoggerSingleton {
  // Static method: called on the class, not on an instance
  static getInstance(): LoggerSingleton {
    /* ... */
  }
}

LoggerSingleton.getInstance(); // no `new` needed
```

### When do we use static in this project?

**Almost never.** We use static only for the `getInstance()` pattern on our two singletons (`DatabaseConnection`, `LoggerSingleton`). Everywhere else — services, repositories, controllers, utilities — we use **instance methods** so we can inject dependencies through the constructor.

Why? Because static methods are tied to a specific implementation. You can't swap `Item.findAll()` for a mock in a test. But you can swap an injected `itemRepo` whose constructor took a different implementation.

This is the whole point of [Dependency Injection](../architecture.md#dependency-injection--by-constructor) — and it's why classes here are full of instance methods, not static helpers.

## Inheritance

A class can build on another class with `extends`:

```ts
abstract class BaseEntity {
  constructor(public readonly id: string) {}
}

class Item extends BaseEntity {
  constructor(
    id: string,
    public title: string
  ) {
    super(id); // call the parent constructor
  }
}
```

`Item` automatically has the `id` field from `BaseEntity`. We use this for every entity in `src/entities/` so they all share the same identity contract.

Use inheritance sparingly. **Prefer composition** (passing dependencies via constructor) over inheritance trees. The only inheritance hierarchy in this codebase is `BaseEntity → User / Item / Tag / Share` — and even that is mostly for type-safety, not behavior reuse.

## Interfaces — the contract layer

In TypeScript, an `interface` declares **what something looks like**, without saying how it works:

```ts
interface IItemRepository {
  findAllByUser(userId: string): Promise<Item[]>;
  findById(id: string): Promise<Item | null>;
  create(data: CreateItemDto): Promise<Item>;
}
```

Any class can _implement_ that interface:

```ts
class PgItemRepository implements IItemRepository {
  /* talks to PostgreSQL */
}

class MockItemRepository implements IItemRepository {
  /* keeps data in a Map for tests */
}
```

Both are valid `IItemRepository`s. Code that depends on the interface doesn't care which one it gets:

```ts
class ItemService {
  // The service asks for "any IItemRepository", not a specific one.
  constructor(private readonly itemRepo: IItemRepository) {}
}

// In production:
const service = new ItemService(new PgItemRepository(db));

// In a test:
const service = new ItemService(new MockItemRepository());
```

**Interfaces are the cornerstone of testable, swappable code.** Every service, every repository, every controller in this project has a matching `I…` interface in `src/interfaces/`.

## Why we like classes here

This codebase is full of classes. The reasoning, in three points:

1. **Identity**: a service holds references to its repositories. Each instance has its own dependencies. That's _identity_ — exactly what classes are for.
2. **Constructor DI**: when you have 3+ dependencies, a constructor is the cleanest place to declare them.
3. **Mocking**: pass a mock in the constructor of the unit under test. Done.

The cost? A bit more boilerplate than free-standing functions. The benefit? Uniform DI everywhere, testability for free, no surprises.

## Cheat sheet

| Term            | Plain English                                  | In code                             |
| :-------------- | :--------------------------------------------- | :---------------------------------- |
| **Class**       | A blueprint, recipe, or mold.                  | `class Item { ... }`                |
| **Instance**    | The real object made from the blueprint.       | `const x = new Item(...)`           |
| **Method**      | A function attached to a class.                | `x.updateTitle('...')`              |
| **Constructor** | The function that runs when you say `new`.     | `constructor(...) { ... }`          |
| **Static**      | A method belonging to the class, not instance. | `LoggerSingleton.getInstance()`     |
| **Interface**   | A contract: "anything that has these methods". | `interface IItemRepository { ... }` |
| **Inheritance** | A class extending another.                     | `class Item extends BaseEntity`     |
| **DI**          | Passing dependencies through the constructor.  | `new Service(repoA, repoB)`         |

## Related docs

- [`../architecture.md`](../architecture.md) — how these concepts come together in the layered architecture.
- [`../conventions/01-typescript-style.md`](../conventions/01-typescript-style.md) — when to use classes vs objects, visibility, naming.

[⬆ Back to docs index](../README.md)

---

_Last updated: 12/05/2026_
