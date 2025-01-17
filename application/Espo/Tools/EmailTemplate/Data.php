<?php
/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM - Open Source CRM application.
 * Copyright (C) 2014-2021 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * EspoCRM is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * EspoCRM is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EspoCRM. If not, see http://www.gnu.org/licenses/.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

namespace Espo\Tools\EmailTemplate;

use Espo\ORM\Entity;

class Data
{
    private $entityHash = [];

    private $emailAddress = null;

    private $parent = null;

    private $parentId = null;

    private $parentType = null;

    private $relatedId = null;

    private $relatedType = null;

    /**
     * @return array<string,Entity> $entityHash
     */
    public function getEntityHash(): array
    {
        return $this->entityHash;
    }

    public function getEmailAddress(): ?string
    {
        return $this->emailAddress;
    }

    public function getParent(): ?Entity
    {
        return $this->parent;
    }

    public function getParentId(): ?string
    {
        return $this->parentId;
    }

    public function getParentType(): ?string
    {
        return $this->parentType;
    }

    public function getRelatedId(): ?string
    {
        return $this->relatedId;
    }

    public function getRelatedType(): ?string
    {
        return $this->relatedType;
    }

    /**
     * @param array<string,Entity> $entityHash
     */
    public function withEntityHash(array $entityHash): self
    {
        $obj = clone $this;
        $obj->entityHash = $entityHash;

        return $obj;
    }

    public function withEmailAddress(?string $emailAddress): self
    {
        $obj = clone $this;
        $obj->emailAddress = $emailAddress;

        return $obj;
    }

    public function withParent(?Entity $parent): self
    {
        $obj = clone $this;
        $obj->parent = $parent;

        return $obj;
    }

    public function withParentId(?string $parentId): self
    {
        $obj = clone $this;
        $obj->parentId = $parentId;

        return $obj;
    }

    public function withParentType(?string $parentType): self
    {
        $obj = clone $this;
        $obj->parentType = $parentType;

        return $obj;
    }

    public function withRelatedId(?string $relatedId): self
    {
        $obj = clone $this;
        $obj->relatedId = $relatedId;

        return $obj;
    }

    public function withRelatedType(?string $relatedType): self
    {
        $obj = clone $this;
        $obj->relatedType = $relatedType;

        return $obj;
    }

    public static function create(): self
    {
        return new self();
    }
}
