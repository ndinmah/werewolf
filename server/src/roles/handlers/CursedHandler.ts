import { RoleHandler, RoleRegistry } from '../RoleHandler.ts';

class CursedHandler implements RoleHandler {}

RoleRegistry.register('CURSED', new CursedHandler());
