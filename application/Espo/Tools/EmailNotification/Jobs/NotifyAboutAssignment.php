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

namespace Espo\Tools\EmailNotification\Jobs;

use Espo\Core\Job\Job;
use Espo\Core\Job\JobData;

use Espo\Tools\EmailNotification\AssignmentProcessor;
use Espo\Tools\EmailNotification\AssignmentProcessorData;

class NotifyAboutAssignment implements Job
{
    private $assignmentProcessor;

    public function __construct(AssignmentProcessor $assignmentProcessor)
    {
        $this->assignmentProcessor = $assignmentProcessor;
    }

    public function run(JobData $data): void
    {
        $this->assignmentProcessor->process(
            AssignmentProcessorData::create()
                ->withAssignerUserId($data->get('assignerUserId'))
                ->withEntityId($data->get('entityId'))
                ->withEntityType($data->get('entityType'))
                ->withUserId($data->get('userId'))
        );
    }
}
