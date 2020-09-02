<?php
/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM - Open Source CRM application.
 * Copyright (C) 2014-2020 Yuri Kuznetsov, Taras Machyshyn, Oleksiy Avramenko
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

namespace Espo\Core\Api;

use Psr\Http\Message\{
    ResponseInterface as Psr7Response,
    StreamInterface,
};

use Espo\Core\Api\Response as ApiResponse;

/**
 * Adapter for PSR-7 response interface.
 */
class ResponseWrapper implements ApiResponse
{
    protected $response;

    public function __construct(Psr7Response $response)
    {
        $this->response = $response;

        // Slim adds Authorization header. It's not needed.
        $this->response = $this->response->withoutHeader('Authorization');
    }

    public function setStatus(int $code, ?string $reason = null)
    {
        $this->response = $this->response->withStatus($code, $reason ?? '');
    }

    public function setHeader(string $name, string $value)
    {
        $this->response = $this->response->withHeader($name, $value);
    }

    public function getHeader(string $name) : ?string
    {
        if (!$this->response->hasHeader($name)) {
            return null;
        }

        return $this->response->getHeaderLine($name);
    }

    public function hasHeader(string $name) : bool
    {
        return $this->response->hasHeader($name);
    }

    public function getResponse() : Psr7Response
    {
        return $this->response;
    }

    public function writeBody(string $string)
    {
        $this->response->getBody()->write($string);
    }

    public function setBody(StreamInterface $body)
    {
        $this->response->setBody($body);
    }
}
