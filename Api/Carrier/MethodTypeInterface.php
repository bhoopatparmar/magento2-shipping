<?php

namespace Salecto\Shipping\Api\Carrier;

interface MethodTypeInterface
{
    /**
     * @return string
     */
    public function getTitle(): string;
}
