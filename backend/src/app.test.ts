import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from './app.js';
import { createDatabase, type DB } from './db.js';

let db: DB;
let app: Express;

beforeEach(() => {
  db = createDatabase(':memory:');
  app = createApp({ db });
});

afterEach(() => {
  db.close();
});

describe('GET /health', () => {
  it('reports liveness', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });
});

describe('POST /api/todos', () => {
  it('creates a todo and returns 201 with the full resource', async () => {
    const res = await request(app).post('/api/todos').send({ title: 'Buy milk' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'Buy milk',
      completed: false,
    });
    expect(res.body.id).toEqual(expect.any(String));
    expect(res.body.createdAt).toEqual(expect.any(String));
    expect(res.body.updatedAt).toEqual(expect.any(String));
  });

  it('trims the title', async () => {
    const res = await request(app).post('/api/todos').send({ title: '  spaced  ' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('spaced');
  });

  it('rejects a missing title with 400', async () => {
    const res = await request(app).post('/api/todos').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
  });

  it('rejects an empty title with 400', async () => {
    const res = await request(app).post('/api/todos').send({ title: '   ' });
    expect(res.status).toBe(400);
  });

  it('rejects unknown fields with 400', async () => {
    const res = await request(app).post('/api/todos').send({ title: 'x', bogus: true });
    expect(res.status).toBe(400);
  });

  it('rejects malformed JSON with 400', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Content-Type', 'application/json')
      .send('{not json');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/todos', () => {
  it('lists todos newest-first', async () => {
    await request(app).post('/api/todos').send({ title: 'first' });
    await request(app).post('/api/todos').send({ title: 'second' });

    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((t: { title: string }) => t.title)).toEqual(['second', 'first']);
  });

  it('filters by completed=true', async () => {
    const a = await request(app).post('/api/todos').send({ title: 'done one' });
    await request(app).post('/api/todos').send({ title: 'pending one' });
    await request(app).patch(`/api/todos/${a.body.id}`).send({ completed: true });

    const res = await request(app).get('/api/todos?completed=true');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('done one');
  });

  it('filters by completed=false', async () => {
    const a = await request(app).post('/api/todos').send({ title: 'done one' });
    await request(app).post('/api/todos').send({ title: 'pending one' });
    await request(app).patch(`/api/todos/${a.body.id}`).send({ completed: true });

    const res = await request(app).get('/api/todos?completed=false');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('pending one');
  });

  it('rejects an invalid completed filter with 400', async () => {
    const res = await request(app).get('/api/todos?completed=maybe');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/todos/:id', () => {
  it('fetches one todo', async () => {
    const created = await request(app).post('/api/todos').send({ title: 'fetch me' });
    const res = await request(app).get(`/api/todos/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).get('/api/todos/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NotFound');
  });
});

describe('PATCH /api/todos/:id', () => {
  it('updates the title and bumps updatedAt', async () => {
    const created = await request(app).post('/api/todos').send({ title: 'old' });
    const res = await request(app).patch(`/api/todos/${created.body.id}`).send({ title: 'new' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('new');
    expect(res.body.completed).toBe(false);
  });

  it('toggles completed', async () => {
    const created = await request(app).post('/api/todos').send({ title: 't' });
    const res = await request(app).patch(`/api/todos/${created.body.id}`).send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('rejects an empty patch body with 400', async () => {
    const created = await request(app).post('/api/todos').send({ title: 't' });
    const res = await request(app).patch(`/api/todos/${created.body.id}`).send({});
    expect(res.status).toBe(400);
  });

  it('returns 404 when updating an unknown id', async () => {
    const res = await request(app).patch('/api/todos/nope').send({ title: 'x' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/todos/:id', () => {
  it('deletes a todo and returns 204', async () => {
    const created = await request(app).post('/api/todos').send({ title: 'bye' });
    const res = await request(app).delete(`/api/todos/${created.body.id}`);
    expect(res.status).toBe(204);

    const after = await request(app).get(`/api/todos/${created.body.id}`);
    expect(after.status).toBe(404);
  });

  it('returns 404 when deleting an unknown id', async () => {
    const res = await request(app).delete('/api/todos/nope');
    expect(res.status).toBe(404);
  });
});

describe('unknown routes', () => {
  it('returns 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
  });
});
