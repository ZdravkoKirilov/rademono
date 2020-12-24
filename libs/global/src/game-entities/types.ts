import { DtoModule, Module, RuntimeModule } from './Module.model';
import { DtoWidget, RuntimeWidget, Widget } from './Widget.model';
import { DtoToken, DtoTokenNode, RuntimeToken, RuntimeTokenNode, Token, TokenNode } from './Token.model';
import { DtoNodeHandler, DtoNodeLifecycle, DtoWidgetNode, NodeHandler, NodeLifecycle, RuntimeNodeHandler, RuntimeNodeLifecycle, RuntimeWidgetNode, WidgetNode } from './WidgetNode.model';
import { DtoSetup, RuntimeSetup, Setup } from './Setup.model';
import { DtoImageAsset, ImageAsset } from './ImageAsset.model';
import { DtoStyle, Style } from './Style.model';
import { DtoSound, Sound } from './Sound.model';
import { DtoExpression, Expression, RuntimeExpression } from './Expression.model';
import { Animation, AnimationStep, DtoAnimation, DtoAnimationStep, RuntimeAnimation, RuntimeAnimationStep } from './Animation.model';
import { Version } from './Version.model';
import { DtoSonata, DtoSonataStep, RuntimeSonata, RuntimeSonataStep, Sonata, SonataStep } from './Sonata.model';
import { DtoShape, DtoShapePoint, RuntimeShape, Shape, ShapePoint } from './Shape.model';
import { DtoSandbox, RuntimeSandbox, Sandbox } from './Sandbox.model';
import { Translation, Text, DtoText, RuntimeText, DtoTranslation, RuntimeTranslation } from './Text.model';
import { DtoGameLanguage, Game, GameLanguage, RuntimeGameLanguage } from './Game.model';

export type VersionedEntity = Module | Setup;
export type DtoVersionedEntity = DtoModule | DtoSetup;
export type RuntimeVersionedEntity = RuntimeModule | RuntimeSetup;

export type ModularEntity = Widget | Token | Text | ImageAsset | Style | Sound | Expression | Animation | Sonata |
    Shape | Sandbox;
export type DtoModularEntity = DtoWidget | DtoToken | DtoText | DtoImageAsset | DtoStyle | DtoSound | DtoExpression | DtoAnimation | DtoSonata |
    DtoShape | DtoSandbox;
export type RuntimeModularEntity = RuntimeWidget | RuntimeToken | RuntimeText | RuntimeExpression | RuntimeAnimation | RuntimeSonata |
    RuntimeShape | RuntimeSandbox;

export type NestedEntity = WidgetNode | NodeLifecycle | NodeHandler | Translation | TokenNode |
    AnimationStep | SonataStep | GameLanguage | ShapePoint;
export type DtoNestedEntity = DtoWidgetNode | DtoNodeLifecycle | DtoNodeHandler | DtoTranslation | DtoTokenNode | DtoAnimationStep |
DtoSonataStep | DtoGameLanguage | DtoShapePoint;
export type RuntimeNestedEntity = RuntimeWidgetNode | RuntimeNodeLifecycle | RuntimeNodeHandler | RuntimeTranslation |
RuntimeTokenNode | RuntimeAnimationStep | RuntimeSonataStep | RuntimeGameLanguage;

export type GameEntity = Game | Version | VersionedEntity | ModularEntity | NestedEntity;

export type EntityWithChildren = WidgetNode | Token | Text | Widget | Animation | Sonata | Setup;