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

namespace Espo\Core\Job;

use Espo\ORM\EntityManager;

use Espo\Core\Utils\DateTime;

use Espo\Entities\Job as JobEntity;

use ReflectionClass;
use DateTimeInterface;
use DateTimeImmutable;
use DateInterval;
use RuntimeException;
use TypeError;

/**
 * Creates job records in database.
 */
class JobScheduler
{
    private $className = null;

    private $queue = null;

    private $group = null;

    /**
     * @var JobData|null
     */
    private $data = null;

    /**
     * @var DateTimeImmutable|null
     */
    private $time = null;

    /**
     * @var DateInterval|null
     */
    private $delay = null;

    private $entityManager;

    public function __construct(EntityManager $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * A class name of the job. Should implement `Job` interface.
     */
    public function setClassName(string $className): self
    {
        if (!class_exists($className)) {
            throw new RuntimeException("Class '{$className}' does not exist.");
        }

        $class = new ReflectionClass($className);

        if (!$class->implementsInterface(Job::class)) {
            throw new RuntimeException("Class '{$className}' does not implement 'Job' interface.");
        }

        $this->className = $className;

        return $this;
    }

    /**
     * In what queue to run the job.
     *
     * @param string|null $queue A queue name. Available names are defined in the `QueueName` class.
     */
    public function setQueue(?string $queue): self
    {
        $this->queue = $queue;

        return $this;
    }

    /**
     * In what group to run the job. Jobs with the same queue but different group
     * can run in parallel. Jobs with the same queue and same group will run one-by-one.
     * The group can be `null`. If the group is not `null`, setting the queue is required.
     *
     * @param string|null $group A group. Any string ID value can be used as a group name. E.g. a user ID.
     */
    public function setGroup(?string $group): self
    {
        $this->group = $group;

        return $this;
    }

    /**
     * Set an execution time. If not set, then the current time will be used.
     */
    public function setTime(?DateTimeInterface $time): self
    {
        $this->time = null;

        if (!is_null($time)) {
            $this->time = DateTimeImmutable::createFromInterface($time);
        }

        return $this;
    }

    /**
     * Set an execution delay.
     */
    public function setDelay(?DateInterval $delay): self
    {
        $this->delay = $delay;

        return $this;
    }

    /**
     * Set data to be passed to the job.
     *
     * @param JobData|array|null $data
     */
    public function setData($data): self
    {
        if (!is_null($data) && !is_array($data) && !$data instanceof JobData) {
            throw new TypeError();
        }

        if (!$data instanceof JobData) {
            $data = JobData::create($data);
        }

        $this->data = $data;

        return $this;
    }

    public function schedule(): JobEntity
    {
        if (!$this->className) {
            throw new RuntimeException("Class name is not set.");
        }

        if ($this->group && $this->queue !== null) {
            throw new RuntimeException("A group can't be set w/o queue.");
        }

        $time = $this->time ?? new DateTimeImmutable();

        if ($this->delay) {
            $time = $time->add($this->delay);
        }

        return $this->entityManager->createEntity(JobEntity::ENTITY_TYPE, [
            'className' => $this->className,
            'queue' => $this->queue,
            'group' => $this->group,
            'targetType' => $this->data->getTargetType(),
            'targetId' => $this->data->getTargetId(),
            'data' => $this->data->getRaw(),
            'executeTime' => $time->format(DateTime::SYSTEM_DATE_TIME_FORMAT),
        ]);
    }
}
