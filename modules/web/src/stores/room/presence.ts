import { rankByScore } from '@telephone-table/engine';
import type { MemberSnapshot } from '@telephone-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../locale';
import type { PlayerColor, PresenceStatus } from './types';

export interface PlayerView {
  id: string;
  name: string;
  initial: string;
  color: PlayerColor;
  status: PresenceStatus;
  isMe: boolean;
  // Shown after the name: "you", "reconnecting" or nothing.
  note: string;
  points: number;
  pointsLabel: string;
  place: number;
  placeLabel: string;
  // Has a seat this round; newcomers watch until the next one.
  seated: boolean;
  // Pressed Done in this step.
  done: boolean;
}

export interface RoomPresenceDeps {
  t: Translate;
}

const stackSize = 5;

// Who is at the table, in join order, with their points. Each person is online ⇄ reconnecting.
export class RoomPresenceStore {
  members: MemberSnapshot[] = [];
  meId = '';
  readonly #deps: RoomPresenceDeps;

  constructor(deps: RoomPresenceDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get placeById(): ReadonlyMap<string, number> {
    return new Map(rankByScore(this.members, (member) => member.points).map(({ item, place }) => [item.id, place]));
  }

  get views(): PlayerView[] {
    return this.members.map((member) => this.#toView(member));
  }

  // Most points first; equal points share a place.
  get standings(): PlayerView[] {
    return [...this.views].sort((a, b) => a.place - b.place);
  }

  // Everyone with a seat this round.
  get seated(): PlayerView[] {
    return this.views.filter((view) => view.seated);
  }

  get stack(): PlayerView[] {
    return this.views.slice(0, stackSize);
  }

  get overflow(): number {
    return Math.max(0, this.members.length - stackSize);
  }

  get hasOverflow(): boolean {
    return this.overflow > 0;
  }

  get count(): number {
    return this.members.length;
  }

  get countLabel(): string {
    return this.#deps.t('people.count', { number: this.count });
  }

  get showLabel(): string {
    return this.#deps.t('people.show', { number: this.count });
  }

  get me(): PlayerView | undefined {
    return this.views.find((view) => view.isMe);
  }

  find(id: string): PlayerView | undefined {
    return this.views.find((view) => view.id === id);
  }

  receive(members: MemberSnapshot[], meId: string): void {
    this.members = members;
    this.meId = meId;
  }

  // Shows a new name before the table confirms it.
  rename(id: string, name: string): void {
    this.members = this.members.map((member) => (member.id === id ? { ...member, name } : member));
  }

  #toView(member: MemberSnapshot): PlayerView {
    const { t } = this.#deps;
    const isMe = member.id === this.meId;
    const place = this.placeById.get(member.id) ?? this.members.length;

    return {
      id: member.id,
      name: member.name,
      initial: member.name.charAt(0).toUpperCase(),
      color: member.color,
      status: member.connected ? 'online' : 'reconnecting',
      isMe,
      note: isMe ? t('people.you') : member.connected ? '' : t('people.reconnecting'),
      points: member.points,
      pointsLabel: t('players.points', { count: member.points }),
      place,
      placeLabel: t('players.place', { place }),
      seated: member.seated,
      done: member.done,
    };
  }
}
