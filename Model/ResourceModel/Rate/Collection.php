<?php

namespace Salecto\Shipping\Model\ResourceModel\Rate;

use Magento\Framework\Model\ResourceModel\Db\Collection\AbstractCollection;
use Salecto\Shipping\Model\Rate;
use Salecto\Shipping\Model\ResourceModel\Rate as RateResource;

class Collection extends AbstractCollection
{
    /**
     * @return void
     */
    public function _construct()
    {
        $this->_init(Rate::class, RateResource::class);
    }
}
